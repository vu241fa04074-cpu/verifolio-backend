const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("../src/models/User");

const API_URL = process.env.SMOKE_API_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
};

const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

const ensureAdmin = async () => {
  const email = "admin@verifolio.test";
  const password = "Admin@12345";

  let admin = await User.findOne({ email });

  if (!admin) {
    admin = await User.create({
      name: "VeriFolio Admin",
      username: "verifolioadmin",
      email,
      password,
      role: "admin",
    });
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
  }

  if (!(await admin.matchPassword(password))) {
    admin.password = await bcrypt.hash(password, 10);
    await admin.save();
  }

  return { email, password };
};

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const suffix = Date.now().toString().slice(-8);
  const userPayload = {
    name: "Smoke Test User",
    username: `smoke${suffix}`,
    email: `smoke${suffix}@example.com`,
    password: "password123",
  };

  const registered = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userPayload),
  });

  const userAuth = authHeader(registered.token);

  const profileForm = new FormData();
  profileForm.append("headline", "Full Stack Developer");
  profileForm.append("bio", "Smoke testing VeriFolio profile workflow.");
  profileForm.append("skills", JSON.stringify(["React", "Node.js", "MongoDB"]));
  profileForm.append("education", JSON.stringify([{ college: "API CRT", degree: "B.Tech", fieldOfStudy: "CSE", startYear: "2022", endYear: "2026" }]));
  profileForm.append("workExperience", JSON.stringify([{ company: "VeriFolio Labs", position: "Developer", startDate: "2026", endDate: "Present", description: "Building portfolio features." }]));
  profileForm.append("socialLinks", JSON.stringify({ github: "https://github.com/example", linkedin: "https://linkedin.com/in/example", portfolio: "", twitter: "" }));
  profileForm.append("isPublic", "true");

  await request("/api/profile/me", {
    method: "PUT",
    headers: userAuth,
    body: profileForm,
  });

  const project = await request("/api/projects", {
    method: "POST",
    headers: userAuth,
    body: JSON.stringify({
      title: "VeriFolio Smoke Project",
      description: "A complete smoke test project entry.",
      technologies: ["React", "Express"],
      githubLink: "https://github.com/example/verifolio",
      liveLink: "https://example.com",
    }),
  });

  await request("/api/certifications", {
    method: "POST",
    headers: userAuth,
    body: JSON.stringify({
      title: "API Development",
      issuer: "CRT",
      issueDate: "2026-05-30",
      credentialId: "CRT-API-001",
      credentialUrl: "https://example.com/cert",
    }),
  });

  await request("/api/achievements", {
    method: "POST",
    headers: userAuth,
    body: JSON.stringify({
      title: "Built VeriFolio",
      description: "Completed the platform smoke workflow.",
      category: "Project",
    }),
  });

  const verificationForm = new FormData();
  verificationForm.append("itemType", "project");
  verificationForm.append("itemId", project._id);

  const verification = await request("/api/verifications", {
    method: "POST",
    headers: userAuth,
    body: verificationForm,
  });

  const adminCredentials = await ensureAdmin();
  await mongoose.disconnect();

  const adminLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(adminCredentials),
  });

  const adminAuth = authHeader(adminLogin.token);

  await request(`/api/verifications/${verification._id}/approve`, {
    method: "PUT",
    headers: adminAuth,
    body: JSON.stringify({ remarks: "Smoke test approved." }),
  });

  const [
    dashboard,
    analytics,
    publicProfile,
    adminStats,
  ] = await Promise.all([
    request("/api/dashboard/stats", { headers: userAuth }),
    request("/api/analytics/me", { headers: userAuth }),
    request(`/api/profile/public/${registered.user.username}`),
    request("/api/admin/stats", { headers: adminAuth }),
  ]);

  console.log(JSON.stringify({
    ok: true,
    user: registered.user.username,
    projectVerified: true,
    dashboard: {
      totalProjects: dashboard.totalProjects,
      totalCertifications: dashboard.totalCertifications,
      totalAchievements: dashboard.totalAchievements,
      totalVerifications: dashboard.totalVerifications,
    },
    analytics: {
      profileViews: analytics.profileViews,
      verificationCount: analytics.verificationCount,
    },
    publicProfileSections: {
      projects: publicProfile.projects.length,
      certifications: publicProfile.certifications.length,
      achievements: publicProfile.achievements.length,
    },
    adminStats: {
      totalUsers: adminStats.totalUsers,
      totalVerificationRequests: adminStats.totalVerificationRequests,
    },
  }, null, 2));
};

main()
  .catch(async (error) => {
    console.error(error);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore disconnect errors during failed smoke tests
    }
    process.exit(1);
  });
