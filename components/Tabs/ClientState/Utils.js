export const getTypeColor = (type) => {
    switch (type) {
        case "string":
            return "magenta";
        case "json":
            return "blue";
        case "boolean":
            return "gold";
        default:
            return "default";
    }
}