import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './entities/user.entity';
import { JWT_SECRET, TOKEN_TTL_SEC } from './auth.constants';
import { hashPassword, signJwt, verifyPassword } from './crypto.util';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // Seed a default owner account on an empty user collection so the system is
  // usable immediately after adding auth. The password can be set via env.
  async onModuleInit() {
    const count = await this.userModel.estimatedDocumentCount();
    if (count === 0) {
      const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      await this.userModel.create({
        username: 'admin',
        passwordHash: hashPassword(password),
        role: 'admin',
        displayName: 'Propriétaire',
        isActive: true,
      });
      console.warn(
        `[auth] Seeded default owner account → username: "admin", password: "${password}". Change it after first login.`,
      );
    }
  }

  async login(username?: string, password?: string) {
    if (!username || !password) {
      throw new BadRequestException('Identifiants requis.');
    }
    const user = await this.userModel
      .findOne({ username: String(username).toLowerCase().trim() })
      .exec();
    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Identifiants invalides.');
    }
    return this.buildSession(user);
  }

  async me(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return this.safe(user);
  }

  async listUsers() {
    const users = await this.userModel
      .find()
      .populate('employee', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
    return users.map((u) => {
      const emp: any = u.employee;
      return {
        ...this.safe(u),
        employeeName: emp
          ? `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim()
          : null,
      };
    });
  }

  async createUser(dto: any) {
    const username = String(dto?.username ?? '').toLowerCase().trim();
    const password = String(dto?.password ?? '');
    const role = dto?.role === 'admin' ? 'admin' : 'employee';

    if (!username || username.length < 3) {
      throw new BadRequestException(
        "Nom d'utilisateur invalide (min. 3 caractères).",
      );
    }
    if (password.length < 4) {
      throw new BadRequestException('Mot de passe trop court (min. 4 caractères).');
    }
    const exists = await this.userModel.findOne({ username }).exec();
    if (exists) {
      throw new ConflictException("Ce nom d'utilisateur existe déjà.");
    }

    let employee: Types.ObjectId | null = null;
    if (dto?.employee) {
      if (!Types.ObjectId.isValid(String(dto.employee))) {
        throw new BadRequestException('Employé invalide.');
      }
      employee = new Types.ObjectId(String(dto.employee));
    }

    const created = await this.userModel.create({
      username,
      passwordHash: hashPassword(password),
      role,
      displayName: String(dto?.displayName ?? '').trim(),
      employee,
      isActive: true,
    });
    return this.safe(created);
  }

  // Admin edit: toggle active, change role/displayName/employee link, or reset
  // the password (when a new one is supplied).
  async updateUser(id: string, dto: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    if (typeof dto?.isActive === 'boolean') {
      // Never let the last active admin lock everyone out.
      if (dto.isActive === false && user.role === 'admin') {
        const otherAdmins = await this.userModel.countDocuments({
          role: 'admin',
          isActive: true,
          _id: { $ne: user._id },
        });
        if (otherAdmins === 0) {
          throw new BadRequestException(
            'Impossible de désactiver le dernier administrateur actif.',
          );
        }
      }
      user.isActive = dto.isActive;
    }
    if (dto?.role === 'admin' || dto?.role === 'employee') user.role = dto.role;
    if (typeof dto?.displayName === 'string') {
      user.displayName = dto.displayName.trim();
    }
    if (dto?.employee !== undefined) {
      user.employee =
        dto.employee && Types.ObjectId.isValid(String(dto.employee))
          ? new Types.ObjectId(String(dto.employee))
          : null;
    }
    if (dto?.newPassword) {
      if (String(dto.newPassword).length < 4) {
        throw new BadRequestException('Mot de passe trop court (min. 4 caractères).');
      }
      user.passwordHash = hashPassword(String(dto.newPassword));
    }

    await user.save();
    return this.safe(user);
  }

  async changePassword(userId: string, oldPassword?: string, newPassword?: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    if (!oldPassword || !verifyPassword(oldPassword, user.passwordHash)) {
      throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }
    if (!newPassword || String(newPassword).length < 4) {
      throw new BadRequestException('Nouveau mot de passe trop court (min. 4 caractères).');
    }
    user.passwordHash = hashPassword(String(newPassword));
    await user.save();
    return { message: 'Mot de passe mis à jour.' };
  }

  // ===== helpers =====
  private buildSession(user: User) {
    const payload = {
      sub: String(user._id),
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      employee: user.employee ? String(user.employee) : null,
    };
    return {
      token: signJwt(payload, JWT_SECRET, TOKEN_TTL_SEC),
      user: this.safe(user),
    };
  }

  private safe(user: User) {
    return {
      id: String(user._id),
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      employee: user.employee ? String(user.employee) : null,
      isActive: user.isActive,
    };
  }
}
