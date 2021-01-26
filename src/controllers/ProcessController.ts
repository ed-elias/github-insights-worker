import  express from 'express';
import QueueService from "../services/QueueService";
// @ts-ignore
import Validator from 'max-validator';
import Post from './dto/IPost';


class ProcessController {
    public router: express.Router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post('/process/insights', this.process);
        this.router.post('/reprocess/insight', this.reprocess);
    }

    process = (request: express.Request, response: express.Response) => {
        const post: Post = request.body
        let check  = Validator.validate(post, PostScheme)
        if( !check.hasError){
            QueueService.getInstance().addSearch(post)
            response.status(202).send(post)
        }else {
            response.status(400).send(post)
        }
    }

    reprocess = (request: express.Request, response: express.Response) => {
        const post: Post = request.body
        let check  = Validator.validate(post, PostScheme)
        if( !check.hasError){
                QueueService.getInstance().publish(post)
                response.status(200).send(post)
        }else {
            response.status(400).send(post)
        }
    }
}
const PostScheme = {
    committerCursor: 'required|string|min:40|max:60',
    repoName: 'required|string',
    repoOwner: 'required|string',
    position: 'nullable|min:-1|max:99',
};

export default ProcessController;
