import createError from "http-errors";
import User from "../models/users.model";

const findAll = async (query: any) => {
  // You can implement filtering, sorting, and pagination based on the query parameters
  // For example, if you want to filter by active status:
  const { page = 1, limit = 5, sort = 'desc', keyword = null, active = null } = query;
  const filter: any = {};
  if (active) {
    filter.active = query.active === 'true'; // Convert string to boolean
  }
  if (keyword) {
    filter.$or = [
      { first_name: new RegExp(keyword, 'i') },
      { last_name: new RegExp(keyword, 'i') },
      { email: new RegExp(keyword, 'i') }
    ];
  }
  const users = await User
  .find({ ...filter })
  .sort({ createdAt: sort === 'asc' ? 1 : -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  return {
    users,
    page,
    limit,
    totalRecords: await User.countDocuments(),
  };
};

const findById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw createError(404, "User not found");
  }
  return user;
};

const create = (payload: any) => {

  const newUser = new User({
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    active: payload.active,
    password: payload.password,
  });
  newUser.save();
  return newUser;
};

const updateById = async (id: string, payload: any) => {
  const user = await findById(id);
 
  Object.assign(user, payload);
 
  console.log('<<=== 🚀updateById user ===>>',user);
  await user.save();
  return user;
};


const deleteById = async (id: string) => {
  const user = await findById(id);
  await User.findByIdAndDelete(user._id);
  return user;
};

// const addRole = async (id: string, role: string) => {
//   const user = await findById(id);
//   //check duplicate role
//   if (user.roles.includes(role)) {
//     throw createError(400, "Role already exists");
//   }
//   user.roles.push(role);
//   await user.save();
//   return user;
// };

// const removeRole = async (id: string, role: string) => {

//   const user = await findById(id);
//   //check role exists
//   if (!user.roles.includes(role)) {
//     throw createError(400, "Role not found");
//   }
//   user.roles = user.roles.filter((r: string) => r !== role);
//   await user.save();
//   return user;
// };

export default {
  findAll,
  findById,
  create,
  deleteById,
  updateById,
  // addRole,
  // removeRole
};