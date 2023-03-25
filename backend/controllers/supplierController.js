import Supplier from "../models/supplierModel.js";
import cloudinary from "../util/cloudinary.js";

const createSupplier = async (req, res, next) => {
  try {
    const data = JSON.parse(req.body.data);
    const result = await cloudinary.uploader.upload(req.file.path);

    const newSupplier = new Supplier({
      ...data,
      image: result.secure_url,
      cloudinary_id: result.public_id,
    });

    const createdSupplier = await newSupplier.save();
    return res.status(201).json(createdSupplier);
  } catch (error) {
    next(error);
  }
};

const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({});
    if (suppliers) return res.status(200).json(suppliers);
    else return res.status(404).json({message: "No supplier found"});
  } catch (error) {
    next(error);
  }
};

const getSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) return res.status(200).json(supplier);
    else return res.status(404).json({message: "Supplier Not Found"});
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const data = JSON.parse(req.body.data);

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({message: "Supplier Not Found"});
    }

    if (req.file) {
      await cloudinary.uploader.destroy(supplier.cloudinary_id);
      let result = await cloudinary.uploader.upload(req.file.path);
      data = {...data, image: result.secure_url, cloudinary_id: result.public_id};
    }

    let filter = {_id: req.params.id};
    let updatedSupplier = await Supplier.findOneAndUpdate(filter, data, {
      new: true,
      runValidators: true,
    });
    return res.status(201).json(updatedSupplier);
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      await cloudinary.uploader.destroy(supplier.cloudinary_id);
      await supplier.remove();
      return res.status(200).json({message: `Supplier ${req.params.id} removed`});
    } else {
      res.status(404);
      throw new Error("Supplier not found");
    }
  } catch (error) {
    next(error);
  }
};

export {getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier};
