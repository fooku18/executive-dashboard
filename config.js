module.exports = {
    prod: {
        graph_endpoint: "https://analytics.perfectdashboard.rocks/apps/executive/dashboard/api",
        root_dir: "https://analytics.perfectdashboard.rocks/static/executive"
    },
    dev: {
        graph_endpoint: "http://localhost:8000/executive/api",
        root_dir: "http://localhost:8080/static/executive"
    }
}