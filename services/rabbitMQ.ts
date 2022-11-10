
require('dotenv').config()
const amqp = require('amqplib')
const _ = require('lodash')
export default class MessageBroker {
    queues: any
    connection: any
    channel: any
    exchange: any
    constructor() {
        this.queues = {}
    }

    async init () {
        this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
        this.channel = await this.connection.createChannel()
        return this
    }

    async createEx ({ name, type, durable = true }: any) {
        if (!this.connection) await this.init()
        await this.channel.assertExchange(name, type, { durable })
        this.exchange = name
        return this
    }

    /**
     * Send message to an exchange
     * @param {Object} - object defining exchange and routingKey
     * @param {Object} msg Message as Buffer
     */
    async publish ({ ex, routingKey }: any, msg: any) {
        const queue = `${ex}.${routingKey}`
        await this.channel.assertQueue(queue, { durable: true })
        this.channel.bindQueue(queue, ex, routingKey)
        this.channel.publish(ex, routingKey, Buffer.from(msg))
    }

    /**
     * @param {Object} - object defining queue name and bindingKey
     * @param {Function} handler Handler that will be invoked with given message and acknowledge function (msg, ack)
     */
    async subscribe ({ exchange, bindingKey }: any, handler: any) {
        const queue = `${exchange}.${bindingKey}`
        if (!this.connection) {
            await this.init()
        }
        if (this.queues[queue]) {
            const existingHandler = _.find(this.queues[queue], (h: any) => h === handler)
            if (existingHandler) {
                return () => this.unsubscribe(queue, existingHandler)
            }
            this.queues[queue].push(handler)
            return () => this.unsubscribe(queue, handler)
        }

        await this.channel.assertQueue(queue, { durable: true })
        this.channel.prefetch(1);
        this.channel.bindQueue(queue, exchange, bindingKey)
        this.queues[queue] = [handler]
        this.channel.consume(
            queue,
            async (msg: any) => {
                const ack = _.once(() => this.channel.ack(msg))
                this.queues[queue].forEach((h: any) => h(msg, ack))
            }
        )
        return () => this.unsubscribe(queue, handler)
    }

    async unsubscribe (queue: any, handler: any) {
        _.pull(this.queues[queue], handler)
    }
}