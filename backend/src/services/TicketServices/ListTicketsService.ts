import { Op, fn, where, col, Filterable, Includeable } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import ShowUserService from "../UserServices/ShowUserService";
import User from "../../models/User";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  queueIds: number[];
  endDate?: string;
  setorId?: string;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  status,
  date,
  showAll,
  userId,
  withUnreadMessages,
  endDate,
  setorId,
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    //[Op.or]: [{ userId }, { status: "pending" }], //Original
    //queueId: { [Op.or]: [queueIds, null] }
    [Op.or]: [{ userId: userId }, { status: "pending" }], //Original
    [Op.or]: [{ queueId: queueIds }, { userId: userId }]
  };
  //console.log('PERÍODO => ', "INICIAL: " + date + " FINAL: " +  endDate);
  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "profilePicUrl"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    }
  ];

  if (showAll === "true") {
    //whereCondition = { queueId: { [Op.or]: [queueIds, null] } }; // ORIGINAL
    whereCondition = { [Op.or]: [{ queueId: queueIds }, { userId }] }; // 27/10/2021 filtra se pertencer ao(s) departamento(s) do usuário ou se pertence diretamente ao usuário.
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  if (searchParam) {
    const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        where: {
          body: where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        required: false,
        duplicating: false
      }
    ];

    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("contact.name")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
        {
          "$message.body$": where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        }
      ]
    };
  }

  if (date && endDate) {
    whereCondition = {
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(endDate))]
      }
    };

    if (status && status != "all") {
      whereCondition = {
        ...whereCondition,
        status
      };
    }
    if (userId && userId != "999") {
      whereCondition = {
        ...whereCondition,
        userId: userId
      };
    }
    if (setorId && setorId != "999") {
      whereCondition = {
        ...whereCondition,
        queueId: setorId
      };
    }
    console.log('DASHBOARD => ', whereCondition);
    console.log('SETOR => ', setorId);
    console.log('USERID => ', userId);
  }

  if (withUnreadMessages === "true") {
    const user = await ShowUserService(userId);
    const userQueueIds = user.queues.map(queue => queue.id);

    /*whereCondition = {  // ORIGINAL
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: { [Op.or]: [userQueueIds, null] },
      unreadMessages: { [Op.gt]: 0 }
    };*/

    whereCondition = {
      [Op.or]: [{ userId: { userId } }, { queueId: { userQueueIds } }],
      status: "pending",
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  const limit = 40;
  const offset = limit * (+pageNumber - 1);
  //console.log('WHERE FINAL => ', whereCondition);
  //console.log('INCLUDE FINAL => ', includeCondition);
  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]]
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
