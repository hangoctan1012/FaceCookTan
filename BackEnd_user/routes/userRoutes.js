const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Follow = require("../models/followModel");
const removeAccent = require("../utils/removeAccent");
const auth = require("../utils/checkHeader");
const { getChannel } = require("../config/rabbitmq");
const STATS_QUEUE = process.env.RABBITMQ_STATS_QUEUE || "stats_queue";

/* ------------------------- SEARCH (ĐỂ LÊN ĐẦU) ------------------------- */
router.get("/search", async (req, res) => {
  try {
    const { q, field } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Thiếu q để search" });
    }

    const searchKey = removeAccent(q);
    const regex = new RegExp(searchKey.split("").join(".*"), "i");

    let query = {};
    let typeArr = [];

    if (field === "name") {
      query = { name_noAccent: regex };
      typeArr = ["name"];
    } else if (field === "user_name") {
      query = { user_name_noAccent: regex };
      typeArr = ["user_name"];
    } else {
      query = {
        $or: [{ name_noAccent: regex }, { user_name_noAccent: regex }],
      };
      typeArr = ["name", "user_name"];
    }

    const users = await User.find(query)
      .select("id user_name name avatar numPosts numFollowed numFollowing tags")
      .limit(20)
      .lean();

    /* ---------------------- BUILD TARGET ARRAY ---------------------- */
    let target = [];

    if (typeArr.includes("name")) {
      target = target.concat(
        users.map(u => u.name).slice(0, 5)
      );
    }

    if (typeArr.includes("user_name")) {
      target = target.concat(
        users.map(u => u.user_name).slice(0, 5)
      );
    }

    target = [...new Set(target)]; // tránh trùng
    target = target.slice(0, 10); // chặn tối đa 10 item

    // 🔔 Push event vào RabbitMQ
    const channel = getChannel(STATS_QUEUE);

    const payload = {
      keyword: q,
      target,
      type: typeArr
    };

    if (!channel) {
      console.error("❌ Không thể gửi RabbitMQ: Channel STATS chưa sẵn sàng!");
    } else {
      console.log("📤 Sending SEARCH STATS event to RabbitMQ:", payload);
      channel.sendToQueue(
        STATS_QUEUE,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );
    }

    return res.json({ success: true, total: users.length, users });
  } catch (err) {
    console.error("❌ Lỗi search:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------- SEARCH BY TAG ------------------------- */
router.get("/tag", async (req, res) => {
  try {
    const { q, after } = req.query;
    const limit = 20;

    const query = {};
    if (after) query.createdAt = { $lt: new Date(after) };

    let typeArr = ["tag"];
    let targetTags = [];

    if (req.query.tag) {
      // tag multiple
      let tags = req.query.tag;
      if (!Array.isArray(tags)) {
        tags = tags.split(",").map(t => t.trim());
      }

      const regexTags = tags.map(t => new RegExp(removeAccent(t), "i"));
      query.tags = { $all: regexTags };

      targetTags = tags.slice(0, 10); // max 10 tag gửi lên
    } else if (q && q.trim() !== "") {
      const keyword = removeAccent(q.trim());
      query.tags = { $regex: keyword, $options: "i" };

      targetTags = [q]; // từ khóa tag
    }

    const users = await User.find(query)
      .select("id user_name name avatar numPosts numFollowed numFollowing tags")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const nextCursor =
      users.length > 0 ? users[users.length - 1].createdAt : null;

    // 🔔 Push event vào RabbitMQ
    const channel = getChannel(STATS_QUEUE);

    const payload = {
      keyword: q || "",
      target: targetTags.slice(0, 10),
      type: typeArr
    };

    if (!channel) {
      console.error("❌ Không thể gửi RabbitMQ: Channel STATS chưa sẵn sàng!");
    } else {
      console.log("📤 Sending TAG SEARCH STATS event to RabbitMQ:", payload);
      channel.sendToQueue(
        STATS_QUEUE,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );
    }

    return res.json({
      success: true,
      total: users.length,
      users,
      nextCursor,
    });
  } catch (err) {
    console.error("❌ Lỗi search tag user:", err);
    return res.status(500).json({ message: err.message });
  }
});


/* ------------------------- GET USERS BY ADMIN ------------------------- */
// GET /users/byAdmin?day=&month=&year=&limit=
router.get("/byAdmin", async (req, res) => {
  try {
    const { day, month, year, limit } = req.query;

    let filter = {};

    // Nếu có bất kỳ filter thời gian nào
    if (day || month || year) {
      let start = new Date();
      let end = new Date();

      // Có year
      if (year) {
        start = new Date(year, 0, 1);
        end = new Date(Number(year) + 1, 0, 1);
      }

      // Có year + month
      if (year && month) {
        start = new Date(year, Number(month) - 1, 1);
        end = new Date(year, Number(month), 1);
      }

      // Có year + month + day
      if (year && month && day) {
        start = new Date(year, Number(month) - 1, Number(day));
        end = new Date(year, Number(month) - 1, Number(day) + 1);
      }

      // Nếu chỉ có month → mặc định year hiện tại
      if (month && !year) {
        const y = new Date().getFullYear();
        start = new Date(y, Number(month) - 1, 1);
        end = new Date(y, Number(month), 1);
      }

      // Nếu chỉ có day → mặc định tháng + năm hiện tại
      if (day && !month && !year) {
        const now = new Date();
        start = new Date(now.getFullYear(), now.getMonth(), Number(day));
        end = new Date(now.getFullYear(), now.getMonth(), Number(day) + 1);
      }

      filter.createdAt = { $gte: start, $lt: end };
    }

    // Tính limit
    let queryLimit = 10; // mặc định
    if (limit === "null" || limit === "0") queryLimit = 0;  // không giới hạn
    else if (limit) queryLimit = Number(limit);

    // Tổng user khớp filter
    const total = await User.countDocuments(filter);

    // Query danh sách với limit
    // Nếu limit = 0 → skip limit
    let usersQuery = User.find(filter)
      .select("_id user_name name avatar email numPosts numFollowed numFollowing createdAt tags")
      .sort({ createdAt: -1 });

    if (queryLimit > 0) {
      usersQuery = usersQuery.limit(queryLimit);
    }

    const users = await usersQuery.lean();

    res.json({
      success: true,
      total,
      returned: users.length,
      filters: { day, month, year, limit: queryLimit },
      users
    });

  } catch (err) {
    console.error("❌ Error in /byAdmin:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const currentUserId = req.user.userID;

    const users = await User.find()
      .select("id user_name name avatar numPosts numFollowed numFollowing tags")
      .lean();

    const followList = await Follow.find({ from: currentUserId })
      .select("to")
      .lean();

    const followingSet = new Set(followList.map(f => f.to));

    users.forEach(u => {
      u.meFollow = followingSet.has(u._id.toString());
    });

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------- GET USER BY ID ------------------------ */
router.get("/:id", auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user.userID;

    const user = await User.findById(targetId)
      .select("id user_name name avatar coverImage numPosts numFollowed numFollowing tags link preference")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const exists = await Follow.findById(`${currentUserId}-${targetId}`);
    user.meFollow = !!exists;

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



/* ------------------------- EDIT PROFILE (SELF) -------------------- */
router.patch("/profile", auth, async (req, res) => {
  try {
    const userID = req.user.userID;
    const { name, tags, email, avatar, link, preference } = req.body;

    const linkArray = Array.isArray(link)
      ? link
      : typeof link === "string"
        ? link.split("\n").map(l => l.trim()).filter(l => l)
        : [];

    const updateData = {
      name,
      name_noAccent: removeAccent(name),
      tags,
      email,
      avatar,
      link: linkArray,
      preference: {
        allergy: preference?.allergy || [],
        illness: preference?.illness || [],
        diet: preference?.diet ? [preference.diet] : ["Bình thường"],
      },
    };

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      updateData,
      { new: true }
    ).select(
      "_id name email avatar coverImage numPosts numFollowed numFollowing tags link preference"
    );

    if (!updatedUser)
      return res.status(404).json({ message: "Không tìm thấy user để cập nhật" });

    res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Lỗi update profile:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------- DELETE USER (ADMIN) -------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Có thể thêm check admin header ở đây nếu cần, nhưng gateway đã check rồi
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Xóa các dữ liệu liên quan (Follow, Post...) nếu cần thiết
    // Ở đây làm đơn giản trước

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
