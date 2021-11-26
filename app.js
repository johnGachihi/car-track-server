require('dotenv').config()

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const port = process.env.SERVER_PORT;
const frontEndUrl = process.env.FRONTEND_URL

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: frontEndUrl,
    methods: ["GET", "POST"]
  }
});

/* Trivial implementation */

let fleet = [];

io.on('connection', (socket) => {
  const auth = socket.handshake.auth;
  console.log(socket.handshake)


  if (auth.type && auth.type === 'vehicle') {
    // Store plateNumber on socket
    socket.data = auth

    // Update internal fleet state
    fleet = [...fleet, {
      plateNumber: auth.plateNumber,
      coordinates: { latitude: 0, longitude: 0, }
    }]

    // Handle vehicle movement event
    socket.on('vehicle-movement', movedVehicle => {
      // Update admins
      io/* .to('admins') */.emit('vehicle-movement', movedVehicle)
      // Update internal fleet state
      fleet = fleet.map(vehicle => {
        return vehicle.plateNumber === movedVehicle.plateNumber
          ? movedVehicle
          : vehicle
      })
    })

    socket.on('disconnect', () => {
      // Update fleet state
      fleet = fleet.filter(vehicle => vehicle.plateNumber !== auth.plateNumber)
    })
  } else if (auth.type && auth.type === 'admin') {
    console.log('Admin joined')
    socket.join('admins');
  }

  // Emit updated fleet to admins always
  io/* .to('admins') */.emit('vehicles', fleet)
})


httpServer.listen(port);