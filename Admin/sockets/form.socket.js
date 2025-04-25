const {
    GetSlugWiseForm,
    GetFormIDWiseFormSocket,
    GetDefaultFormSocket
} = require("../controller/signupForm.controller.js");

const formSocket = (io) => {
    io.on("connection", (socket) => {
        socket.on(
            "slug_wise_form",
            async (request, callback) => {
                const usersData = await GetSlugWiseForm(request);
                callback(usersData);
            }
        );

        socket.on(
            "form_id_wise_form",
            async (request, callback) => {
                const usersData = await GetFormIDWiseFormSocket(request);
                callback(usersData);
            }
        );

        socket.on(
            "get_default_form",
            async (request, callback) => {
                const usersData = await GetDefaultFormSocket(request);
                callback(usersData);
            }
        );
    });

    return io;
};

module.exports = formSocket;
