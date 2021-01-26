import App from './app';
import ProcessController from "./controllers/ProcessController";
import QueueService from "./services/QueueService";

const app = new App(
    [
        new ProcessController(),
    ]
);
QueueService.getInstance();
app.listen();
