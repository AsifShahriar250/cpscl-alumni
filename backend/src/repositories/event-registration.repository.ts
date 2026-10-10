import { prisma } from "../config/database.js";
import {
  RegistrationStatus,
} from "../generated/prisma/client.js";
import type { EventRegistrationQuery } from "../validators/event-registration.validator.js";

export class EventRegistrationRepository {
  /*
  |--------------------------------------------------------------------------
  | Find registration by Event + User
  |--------------------------------------------------------------------------
  |
  | A user can register only once for the same event.
  |
  */

  async findByEventAndUser(
    eventId: string,
    userId: string,
  ) {
    return prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Find registration by ID
  |--------------------------------------------------------------------------
  */

  async findById(id: string) {
    return prisma.eventRegistration.findUnique({
      where: {
        id,
      },
    });
  }

    /*
  |--------------------------------------------------------------------------
  | Find registrations for an event
  |--------------------------------------------------------------------------
  */

  async findByEvent(
    eventId: string,
    query: EventRegistrationQuery,
  ) {
    const {
      status,
      page,
      limit,
    } = query;

    const where = {
      eventId,
      ...(status !== undefined && { status }),
    };

    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { registeredAt: "asc" },
          { id: "asc" },
        ],
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              alumniProfile: {
                select: {
                  fullName: true,
                  phone: true,
                  graduationYear: true,
                  profilePhotoUrl: true,
                },
              },
            },
          },
        },
      }),

      prisma.eventRegistration.count({
        where,
      }),
    ]);

    return {
      registrations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
    /*
  |--------------------------------------------------------------------------
  | Get registration statistics
  |--------------------------------------------------------------------------
  */

  async getStatsByEvent(eventId: string) {
    return prisma.eventRegistration.groupBy({
      by: ["status"],
      where: {
        eventId,
      },
      _count: {
        _all: true,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Count active registrations
  |--------------------------------------------------------------------------
  |
  | REGISTERED and ATTENDED both occupy an event seat.
  | CANCELLED registrations do not occupy a seat.
  |
  */

  async countActiveByEvent(eventId: string) {
    return prisma.eventRegistration.count({
      where: {
        eventId,
        status: {
          in: [
            RegistrationStatus.REGISTERED,
            RegistrationStatus.ATTENDED,
          ],
        },
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Create registration
  |--------------------------------------------------------------------------
  */

  async create(data: {
    eventId: string;
    userId: string;
    status?: RegistrationStatus;
  }) {
    return prisma.eventRegistration.create({
      data: {
        eventId: data.eventId,
        userId: data.userId,
        status:
          data.status ??
          RegistrationStatus.REGISTERED,
      },
    });
  }


  /**
   * Atomically registers a user while protecting event capacity.
   */

  async registerAtomically(eventId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Lock the event row and read its current registration rules.
      const events = await tx.$queryRaw<
        Array<{
          id: string;
          capacity: number | null;
          status: string;
          startsAt: Date;
          endsAt: Date;
          registrationDeadline: Date | null;
        }>
      >`
        SELECT
          id,
          capacity,
          status,
          starts_at AS "startsAt",
          ends_at AS "endsAt",
          registration_deadline AS "registrationDeadline"
        FROM events
        WHERE id = ${eventId}::uuid
        FOR UPDATE
      `;

      const event = events[0];

      if (!event) {
        throw new Error("EVENT_NOT_FOUND");
      }

      if (event.status !== "PUBLISHED") {
        throw new Error("EVENT_NOT_OPEN_FOR_REGISTRATION");
      }

      const now = new Date();

      if (event.endsAt <= now) {
        throw new Error("EVENT_ALREADY_ENDED");
      }

      if (
        event.registrationDeadline !== null &&
        event.registrationDeadline <= now
      ) {
        throw new Error("REGISTRATION_DEADLINE_PASSED");
      }

      const existing = await tx.eventRegistration.findUnique({
        where: {
          eventId_userId: { eventId, userId },
        },
      });

      if (existing && existing.status !== RegistrationStatus.CANCELLED) {
        throw new Error("ALREADY_REGISTERED");
      }

      const activeCount = await tx.eventRegistration.count({
        where: {
          eventId,
          status: {
            in: [
              RegistrationStatus.REGISTERED,
              RegistrationStatus.ATTENDED,
            ],
          },
        },
      });

      if (event.capacity !== null && activeCount >= event.capacity) {
        throw new Error("EVENT_FULL");
      }

      if (existing) {
        return tx.eventRegistration.update({
          where: { id: existing.id },
          data: { status: RegistrationStatus.REGISTERED },
        });
      }

      return tx.eventRegistration.create({
        data: {
          eventId,
          userId,
          status: RegistrationStatus.REGISTERED,
        },
      });
    });
  }
  /*
  |--------------------------------------------------------------------------
  | Update registration status
  |--------------------------------------------------------------------------
  */

  async updateStatus(
    id: string,
    status: RegistrationStatus,
  ) {
    return prisma.eventRegistration.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Delete registration
  |--------------------------------------------------------------------------
  */

  async delete(id: string) {
    return prisma.eventRegistration.delete({
      where: {
        id,
      },
    });
  }
}

export const eventRegistrationRepository =
  new EventRegistrationRepository();
