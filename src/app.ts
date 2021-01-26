// @ts-ignore
import express from 'express';

class App {
    public app: express.Application;
    public port = process.env.PORT || 3001

    constructor(controllers: any[]) {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }

    private initializeMiddlewares() {
        this.app.use(express.json({
            inflate: true,
            limit: '100kb',
            strict: true,
            type: 'application/json',
            verify: undefined
        }));
        this.app.use(express.urlencoded({extended: false}));
    }

    private initializeControllers(controllers: any[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`⚡️[server]: Server is running at https://localhost:${this.port}`);
        });
    }
}

export default App;
