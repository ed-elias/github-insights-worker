// Imports the Google Cloud client library
import {PubSub, Topic} from '@google-cloud/pubsub'
import Post from "../controllers/dto/IPost";
import GetUsersLinuxService from "./GetUsersLinuxService";

class QueueService {

    private getUsersLinuxService: GetUsersLinuxService = new GetUsersLinuxService();
    private static instance: QueueService;
    private githubSearch!: Topic;
    private githubData!: Topic;

    constructor() {
        this.quickstartPubSub().then(r => console.log("PubSub started"));
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }

        return QueueService.instance;
    }


    async quickstartPubSub(
        projectId = 'unique-302723',
        githubSearch = 'github-search',
        githubData = 'github-data',
        subscriptionName = 'github-search-pull',
        keyFilename =  process.env.GOOGLE_KEY_PATH || '/home/ederson/google/unique-google.json'
    ) {
        // Instantiates a client
        const pubsub = new PubSub({projectId, keyFilename});


        this.githubSearch = pubsub.topic(githubSearch);
        this.githubData = pubsub.topic(githubData);



        const subscription = this.githubSearch.subscription(subscriptionName);

        // Receive callbacks for new messages on the subscription
        subscription.on('message', msg => {
            try {
                new GetUsersLinuxService().parseData(JSON.parse(msg.data.toString()))
                    .then(r => {
                        this.githubData.publish(Buffer.from(JSON.stringify(r)))
                        msg.ack()
                    })
                    .catch(reason => {
                        console.error("Failed send data  message " + msg.id + "\n" + reason)
                        msg.nack()
                    })

                console.log('process :', msg.data.toString());

            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.error("invalid message " + msg.id + "\n" + e)
                    msg.ack()
                } else {
                    console.error("Failed Process message " + msg.id + "\n" + e)
                    msg.nack()
                }
            }
        });

        // Receive callbacks for errors on the subscription
        subscription.on('error', error => {
            console.error('Received error:', error);
        });

    }

    public publish(message: object) {
        this.githubSearch.publishJSON(message);
    }

    public async addSearch(message: Post) {
        let i = message.position || -1;
        let data = {repoName: message.repoName, repoOwner: message.repoOwner}

        this.getUsersLinuxService.getTotalCount(data).then(totalCount => {

            let limit = process.env.LIMIT_SEARCH || totalCount

            while (i  <= limit) {
                let cursor: object
                if (i > -1) {
                    cursor = {committerCursor: `${message.committerCursor} ${i}`}
                } else {
                    cursor = {committerCursor: null}
                }

                data = {...data, ...cursor};
                this.githubSearch.publishJSON(data);
                console.log("add task for search in queue " + message.committerCursor)
                i = i + 100
            }
        });

    }
}

export default QueueService;
