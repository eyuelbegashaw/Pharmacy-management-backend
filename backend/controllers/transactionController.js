import Drug from "../models/drugModel.js";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";

const createTransaction = async (req, res, next) => {
  try {
    const transactionData = req.body;

    // Get the list of drugs being sold
    const drugsBeingSold = transactionData.map(transaction => {
      return {
        drugId: transaction.drug_id,
        quantity: transaction.quantity,
        drugName: transaction.brand_name,
      };
    });

    // Check if all drugs meet the quantity requirement
    for (const drug of drugsBeingSold) {
      const drugModel = await Drug.findById(drug.drugId);
      if (drug.quantity > drugModel.quantity) {
        throw new Error(
          `Not enough quantity available for ${drugModel.brand_name} (${drugModel.batch_number}) drug`
        );
      }
    }

    // Update the drug model by subtracting the sold quantity
    for (const drug of drugsBeingSold) {
      const drugModel = await Drug.findById(drug.drugId);
      drugModel.quantity -= drug.quantity;
      if (drugModel.quantity <= drugModel.lowStock) {
        const notification = {
          drug_id: drugModel,
          message: `There are only ${drugModel.quantity} units of ${drugModel.brand_name} (${drugModel.batch_number}) drug remaining`,
          read: false,
          createdAt: new Date(),
        };
        const usersWithNotification = await User.find({
          notifications: {
            $elemMatch: {
              drug_id: drugModel._id,
            },
          },
        });

        if (usersWithNotification.length === 0) {
          await User.updateMany({}, {$push: {notifications: notification}});
        }
      }
      await drugModel.save();
    }

    // Insert the transaction into the database
    const createdTransactions = await Transaction.insertMany(transactionData);

    const updatedDrugs = await Drug.find({
      expiry_date: {$gt: new Date()},
    })
      .populate({
        path: "category_id",
        select: "name",
      })
      .populate({
        path: "supplier_id",
        select: "name ",
      });

    //emit function
    req.io.sockets.emit("drugUpdate", updatedDrugs);
    return res.status(201).json(createdTransactions);
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({}).populate({
      path: "sale_by",
      select: "name",
    });
    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

const dailyTransaction = async (req, res, next) => {
  try {
    let startDate = req.body.startDate;
    let endDate = req.body.startDate;
    let sale_by = req.body.saleBy;

    if (req.body.endDate) {
      endDate = req.body.endDate;
    }

    const startDay = new Date(startDate);
    startDay.setUTCHours(0, 0, 0, 0);
    const endDay = new Date(endDate);
    endDay.setUTCHours(23, 59, 59, 999);

    let dailyTransactions;

    if (sale_by && startDate && endDate) {
      dailyTransactions = await Transaction.find({
        createdAt: {
          $gte: startDay,
          $lte: endDay,
        },
        sale_by: req.body.saleBy,
      }).populate({
        path: "sale_by",
        select: "name",
      });
    } else if (!sale_by && startDate && endDate) {
      dailyTransactions = await Transaction.find({
        createdAt: {
          $gte: startDay,
          $lte: endDay,
        },
      }).populate({
        path: "sale_by",
        select: "name",
      });
    } else if (!startDate && !endDate && sale_by) {
      dailyTransactions = await Transaction.find({
        sale_by: req.body.saleBy,
      }).populate({
        path: "sale_by",
        select: "name",
      });
    } else if (!startDate && !endDate && !sale_by) {
      dailyTransactions = await Transaction.find({}).populate({
        path: "sale_by",
        select: "name",
      });
    }

    return res.status(200).json(dailyTransactions);
  } catch (error) {
    next(error);
  }
};

const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (transaction) return res.status(200).json(transaction);
    else return res.status(404).json({message: "Transaction Not Found"});
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({message: "transaction Not Found"});
    }

    let filter = {_id: req.params.id};
    let updatedTransaction = await Transaction.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(201).json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (transaction) {
      await transaction.remove();
      return res.status(200).json({message: `Transaction ${req.params.id} removed`});
    } else {
      res.status(404);
      throw new Error("Transaction not found");
    }
  } catch (error) {
    next(error);
  }
};

export {
  getTransaction,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  dailyTransaction,
};
