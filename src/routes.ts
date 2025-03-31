import express from "express";

const router = express.Router();

// Dummy Contacts Data
const contacts = [
  { id: 1, name: "John Doe", phone: "123-456-7890" },
  { id: 2, name: "Jane Smith", phone: "987-654-3210" }
];

// GET all contacts
router.get("/", (req, res) => {
  res.json(contacts);
});

// POST a new contact
router.post("/", (req: any, res:any) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  const newContact = { id: contacts.length + 1, name, phone };
  contacts.push(newContact);
  res.status(201).json(newContact);
});

export default router;
