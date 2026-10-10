import { userRepository } from "../repositories/user.repository.js";

export class AdminService {
  async getPendingVerificationUsers() {
    return userRepository.findPendingVerificationUsers();
  }

  async approveUser(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.status !== "PENDING_VERIFICATION") {
      throw new Error("Only pending verification users can be approved");
    }

    return userRepository.approveUser(userId);
  }
}

export const adminService = new AdminService();
