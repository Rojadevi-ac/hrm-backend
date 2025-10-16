import mongoose from "mongoose";

const officeConfigSchema = new mongoose.Schema({
    officeLocation: {
        latitude: Number,
        longitude: Number,
        radius: Number, // in meters
    },
});

export default mongoose.model("OfficeConfig", officeConfigSchema);

