const {
    getUserById,
    getUser,
    ChatCreate,
    getUsersAllData
} = require("../controller/communication.controller.js");

const communicationSocket = (io) => {
    io.on("connection", (socket) => {
        socket.on(
            "check_user_status",
            async (request, callback) => {
                const usersData = await getUserById({ user_id: request.user_id });
                callback(usersData);
            }
        );
        
        socket.on("request_authentication_users_all2", async (request, callback) => {
            const usersData = await getUser({
                search: request.search,
                limit: request.limit,
                page: request.page,
            });
            callback(usersData);
        });

        

        socket.on(
            "chat_create",
            async (request, callback) => {
                const usersData = await ChatCreate({
                    user_id: request.user_id,
                    req: request.req,
                    created_by: request.created_by,
                });
                callback(usersData);
            }
        );


        socket.on(
            "getUsersAllData",
            async (request, callback) => {
                const usersData = await getUsersAllData({ user_id: request.user_id });
                callback(usersData);
            }
        );
    });

    return io;
};

module.exports = communicationSocket;
