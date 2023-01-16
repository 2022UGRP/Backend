const mongoose = require('mongoose');
module.exports = () => {
    function connect() {
        mongoose.connect('mongodb://localhost:27017', {dbName: 'NFTI'}, function(err) {
            if(err){
                console.error('mongodb connection eroor', err);
            }
            console.log('mongodb connected');
        });
    }
    connect();
    mongoose.connection.on('disconnected', connect);
}