import mongoose from "mongoose";

const drugSchema = mongoose.Schema(
  {
    brand_name: {
      type: String,
      required: true,
    },
    generic_name: {
      type: String,
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "category",
    },
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "supplier",
    },
    batch_number: {
      type: String,
      required: true,
      unique: true,
    },
    purchased_price: {
      type: Number,
      required: true,
    },
    selling_price: {
      type: Number,
      required: true,
    },
    production_date: {
      type: Date,
      required: true,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    purchased_date: {
      type: Date,
      required: true,
    },
    purchased_quantity: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    lowStock: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    measurement_size: {
      type: String,
      required: true,
    },
    remark: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const drug = mongoose.model("drug", drugSchema);

export default drug;
