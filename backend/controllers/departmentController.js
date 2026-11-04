const Department = require("../models/Department");
const { getIsConnected } = require("../config/db");

const DEFAULT_DEPARTMENTS = [
  { _id: "dep_001", departmentName: "Roads & Infrastructure", description: "Potholes, footpaths, and road repair" },
  { _id: "dep_002", departmentName: "Water Supply", description: "Pipeline leaks, water pressure, and shortages" },
  { _id: "dep_003", departmentName: "Electricity", description: "Streetlights, wiring, and power outages" },
  { _id: "dep_004", departmentName: "Sanitation & Waste", description: "Garbage collection and sewage disposal" },
  { _id: "dep_005", departmentName: "Public Health", description: "Mosquito control, sanitation, and dispensaries" },
];

let inMemoryDepartments = [...DEFAULT_DEPARTMENTS];

// Create Department
const createDepartment = async (req, res) => {
  try {
    const { departmentName, description } = req.body;

    if (getIsConnected()) {
      const department = await Department.create({ departmentName, description });
      return res.status(201).json(department);
    }

    const newDept = {
      _id: "dep_" + Date.now(),
      departmentName,
      description,
    };
    inMemoryDepartments.push(newDept);
    res.status(201).json(newDept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Departments
const getDepartments = async (req, res) => {
  try {
    if (getIsConnected()) {
      const departments = await Department.find();
      return res.status(200).json(departments);
    }
    res.status(200).json(inMemoryDepartments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Department
const updateDepartment = async (req, res) => {
  try {
    if (getIsConnected()) {
      const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (department) return res.status(200).json(department);
    }

    const idx = inMemoryDepartments.findIndex((d) => d._id === req.params.id);
    if (idx !== -1) {
      inMemoryDepartments[idx] = { ...inMemoryDepartments[idx], ...req.body };
      return res.status(200).json(inMemoryDepartments[idx]);
    }

    res.status(404).json({ message: "Department not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Department
const deleteDepartment = async (req, res) => {
  try {
    if (getIsConnected()) {
      const department = await Department.findByIdAndDelete(req.params.id);
      if (department) return res.status(200).json({ message: "Department deleted successfully" });
    }

    inMemoryDepartments = inMemoryDepartments.filter((d) => d._id !== req.params.id);
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  DEFAULT_DEPARTMENTS,
};
