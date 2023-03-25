import Drug from "../models/drugModel.js";
import User from "../models/userModel.js";
import {addDays, startOfDay, endOfDay} from "date-fns";

const createDrug = async (req, res, next) => {
  try {
    const newDrug = new Drug(req.body);
    const createdDrug = await newDrug.save();
    const populatedDrug = await Drug.findById(createdDrug._id)
      .populate({
        path: "category_id",
        select: "name",
      })
      .populate({
        path: "supplier_id",
        select: "name",
      })
      .exec();

    return res.status(201).json(populatedDrug);
  } catch (error) {
    next(error);
  }
};

const getDrugs = async (req, res, next) => {
  try {
    const drugs = await Drug.find({})
      .populate({
        path: "category_id",
        select: "name",
      })
      .populate({
        path: "supplier_id",
        select: "name ",
      });
    return res.status(200).json(drugs);
  } catch (error) {
    next(error);
  }
};

const getDrug = async (req, res, next) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (drug) return res.status(200).json(drug);
    else return res.status(404).json({message: "Drug not found"});
  } catch (error) {
    next(error);
  }
};

const updateDrug = async (req, res, next) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug) {
      return res.status(404).json({message: "Drug Not Found"});
    }

    let filter = {_id: req.params.id};
    let updatedDrug = await Drug.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: "category_id",
        select: "name",
      })
      .populate({
        path: "supplier_id",
        select: "name ",
      });
    return res.status(201).json(updatedDrug);
  } catch (error) {
    next(error);
  }
};

const deleteDrug = async (req, res, next) => {
  try {
    const drug = await Drug.findById(req.params.id);

    if (drug) {
      await drug.remove();
      return res.status(200).json({message: `Drug ${req.params.id} removed`});
    } else {
      res.status(404);
      throw new Error("Drug not found");
    }
  } catch (error) {
    next(error);
  }
};

const expiredDrugs = async (req, res, next) => {
  try {
    const today = new Date();
    const expiredDrugs = await Drug.find({
      expiry_date: {$lte: today},
    });

    return res.status(200).json(expiredDrugs);
  } catch (error) {
    next(error);
  }
};

const drugsExpiringSoon = async (req, res, next) => {
  try {
    const daysToExpiration = req.body.days;
    const today = new Date();
    const expirationDate = addDays(today, daysToExpiration);
    const expiredDrugs = await Drug.find({
      expiry_date: {$gte: today, $lte: expirationDate},
    });
    return res.status(201).json(expiredDrugs);
  } catch (error) {
    next(error);
  }
};

const lowStockDrugs = async (req, res, next) => {
  try {
    const response = await Drug.find({quantity: {$lte: req.body.quantity}});
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const drugExpiringNotification = async () => {
  try {
    const today = new Date();
    const expirationDate = addDays(today, 30);
    const expiringDrugs = await Drug.find({
      expiry_date: {$gte: today, $lte: expirationDate},
    });

    //Loop through each expiring drug and send a notification to each user
    for (let drug of expiringDrugs) {
      const timeDiff = Math.ceil((drug.expiry_date - today) / (1000 * 60 * 60 * 24));
      const notification = {
        drug_id: drug._id,
        message: `The drug '${drug.brand_name} (${drug.batch_number})' will expire in ${timeDiff} days`,
        read: false,
        createdAt: new Date(),
      };
      await User.updateMany({}, {$push: {notifications: notification}});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const dailyStock = async (req, res, next) => {
  try {
    let startDate = req.body.startDate;
    let endDate = req.body.startDate;
    let supplier = req.body.supplier;

    if (req.body.endDate) {
      endDate = req.body.endDate;
    }

    let dailyStock;
    const startDay = startOfDay(new Date(startDate));
    const endDay = endOfDay(new Date(endDate));

    if (supplier && startDate && endDate) {
      dailyStock = await Drug.find({
        purchased_date: {
          $gte: startDay,
          $lte: endDay,
        },
        supplier_id: req.body.supplier,
      }).populate({
        path: "supplier_id",
        select: "name",
      });
    } else if (!supplier && startDate && endDate) {
      dailyStock = await Drug.find({
        purchased_date: {
          $gte: startDay,
          $lte: endDay,
        },
      }).populate({
        path: "supplier_id",
        select: "name",
      });
    } else if (!startDate && !endDate && supplier) {
      dailyStock = await Drug.find({
        supplier_id: req.body.supplier,
      }).populate({
        path: "supplier_id",
        select: "name",
      });
    } else if (!startDate && !endDate && !supplier) {
      dailyStock = await Drug.find({}).populate({
        path: "supplier_id",
        select: "name",
      });
    }

    return res.status(200).json(dailyStock);
  } catch (error) {
    next(error);
  }
};

export {
  getDrugs,
  getDrug,
  createDrug,
  updateDrug,
  deleteDrug,
  expiredDrugs,
  drugsExpiringSoon,
  lowStockDrugs,
  drugExpiringNotification,
  dailyStock,
};
