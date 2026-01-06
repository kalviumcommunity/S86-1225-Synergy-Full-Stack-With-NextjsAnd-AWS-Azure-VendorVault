export default function handler(req, res) {
  res.status(500).json({ status: "error", uptime: process.uptime() });
}
