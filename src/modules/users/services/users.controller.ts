// users.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';

export const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await usersService.findAll(req.query);
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

export const findById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await usersService.findById(req.params.id);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await usersService.create(req.body);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await usersService.deleteById(req.params.id);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.updateById(req.params.id, req.body);
    res.status(200).json({
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export default {
    findAll,
    findById,
    create,
    deleteById,
    updateById
};