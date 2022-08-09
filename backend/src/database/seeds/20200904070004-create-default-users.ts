import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "Suporte Vojoo",
          email: "falecom@vojoo.com.br",
          passwordHash: "$2a$08$fiQntoL7pdSs0o5vQNy1pOv7SA8AFOs0pnQ/Wb388RrXO5emu/DFO",
          profile: "admin",
          tokenVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};