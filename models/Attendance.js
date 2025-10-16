import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
    checkIn: Date,
    checkOut: Date,
    location: { latitude: Number, longitude: Number },
    status: { type: String, enum: ["Present", "Absent", "Late"], default: "Present" },
});

export default mongoose.model("Attendance", attendanceSchema);
