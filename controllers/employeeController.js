import User from "../models/User.js";

export const createEmployee = async (req, res) => {
    const { name, email, phone, designation, department, dateOfJoining, password } = req.body;
    const employee = await User.create({
        name, email, phone, designation, department, dateOfJoining, password, role: "Employee"
    });
    res.json(employee);
};

export const getEmployees = async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = { name: { $regex: search, $options: "i" } };
    const employees = await User.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("-password");
    res.json(employees);
};
