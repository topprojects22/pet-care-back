import { Request } from 'express';
import { User } from '@prisma/client';

/**
 * Расширенный тип Request с типизированным пользователем
 * Используется для типизации req.user в контроллерах и guards
 */
export interface AuthenticatedRequest extends Request {
  user: User;
}

