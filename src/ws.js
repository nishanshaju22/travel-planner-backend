import { WebSocketServer } from 'ws'
import cookie from 'cookie';
import jwt from 'jsonwebtoken'

export const clients = new Map()

export const initWebSocket = (server) => {
    const wss = new WebSocketServer({ server })

    wss.on('connection', (ws, req) => {
        try {
            const cookies = cookie.parse(req.headers.cookie);
            const token = cookies.jwt

            if (!token) {
                ws.close()
                return
            }
            
            const decoded = jwt.verify(token, process.env.JWT)
            const userId = decoded.id

            ws.userId = userId

            if (!clients.has(userId)) {
                clients.set(userId, new Set())
            }

            clients.get(userId).add(ws)

            console.log(`User connected (${clients.get(userId).size} sockets)`)

            ws.on('close', () => {
                const userSockets = clients.get(userId)

                if (userSockets) {
                    userSockets.delete(ws)

                    if (userSockets.size === 0) {
                        clients.delete(userId)
                    }
                }
            })
        } catch (err) {
            console.error('WS auth failed', err)
            ws.close()
        }
    });
}
