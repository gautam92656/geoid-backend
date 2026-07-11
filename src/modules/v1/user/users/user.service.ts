import * as userRepository from "./user.repository"
import { NotFoundError } from "../../../../shared/errors/NotFoundError"
import { toUserDTO } from "./user.mapper"
import type { UserDTO } from "./user.types"

export async function getById(id: number): Promise<UserDTO> {
  const user = await userRepository.findById(id)
  if (!user) throw new NotFoundError("User not found")
  return toUserDTO(user)
}
