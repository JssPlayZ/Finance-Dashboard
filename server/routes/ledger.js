const express = require('express');
const router = express.Router();
const LedgerEntry = require('../models/LedgerEntry');
const mongoose = require("mongoose");

// Add a new ledger entry
router.post('/add', async (req, res) => {
  try {
    const { userId, date, description, type, amount, category } = req.body;
    
    if (!userId || !date || !description || !type || !amount || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (amount < 0) {
    return res.status(400).json({ error: "Amount cannot be negative" });
  }

    const entry = new LedgerEntry({ userId, date, description, type, amount, category });
    await entry.save();

    res.status(201).json({ message: "Entry added successfully", entry });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all ledger entries for a user
router.get('/user/:id', async (req, res) => {
  try {
    const entries = await LedgerEntry.find({ userId: req.params.id }).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ message: "Error fetching entries" });
  }
});

// GET trial balance for a user
router.get('/trial-balance/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const trialBalance = await LedgerEntry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$category",
          debit: {
            $sum: {
              $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0]
            }
          },
          credit: {
            $sum: {
              $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0]
            }
          }
        }
      },
      {
        $project: {
          category: "$_id",
          debit: 1,
          credit: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json(trialBalance);
  } catch (err) {
    res.status(500).json({ message: "Error generating trial balance", error: err.message });
  }
});

// GET Balance Sheet for a user
router.get('/balance-sheet/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const data = await LedgerEntry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" }
        }
      },
      {
        $project: {
          category: "$_id.category",
          type: "$_id.type",
          total: 1,
          _id: 0
        }
      }
    ]);

    // Separate into Assets and Liabilities/Equity
    const assets = data.filter(d => d.type === "Debit");
    const liabilities = data.filter(d => d.type === "Credit");

    res.status(200).json({ assets, liabilities });
  } catch (err) {
    res.status(500).json({ message: "Error generating balance sheet", error: err.message });
  }
});

// GET summary for the dashboard
router.get("/summary/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await LedgerEntry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let totalCredit = 0;
    let totalDebit = 0;

    result.forEach((item) => {
      if (item._id === "Credit") totalCredit = item.total;
      if (item._id === "Debit") totalDebit = item.total;
    });

    res.json({
      totalCredit,
      totalDebit,
      balance: totalCredit - totalDebit,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard summary", error: err.message });
  }
});

// GET summary category wise
router.get("/category-summary/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const summary = await LedgerEntry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: "Debit" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } }
    ]);

    const result = summary.map((item) => ({
      category: item._id,
      amount: item.total,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to get category summary", error: err.message });
  }
});

// DELETE entry by ID
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await LedgerEntry.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Entry not found" });

    res.json({ message: "Entry deleted successfully", deleted });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

// UPDATE ledger entry
router.put("/:id", async (req, res) => {
  try {
    const updated = await LedgerEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Entry not found" });

    res.json({ message: "Entry updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// Get line summary: total debit/credit grouped by date
router.get('/line-summary/:userId', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const summary = await LedgerEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$date",
          credit: {
            $sum: {
              $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0]
            }
          },
          debit: {
            $sum: {
              $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: { $dateToString: { format: "%Y-%m-%d", date: "$_id" } },
          credit: 1,
          debit: 1
        }
      }
    ]);

    res.json(summary);
  } catch (err) {
    console.error("Error fetching line summary:", err);
    res.status(500).json({ error: "Error fetching line summary", details: err.message });
  }
});

module.exports = router;