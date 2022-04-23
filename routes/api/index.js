const router = require('express').Router();
const commentRoutes = require('./comment-routes') // this has to be before the pizza routes
const pizzaRoutes = require('./pizza-routes');


// add prefix of `/pizzas` to routes created in `pizza-routes.js`
router.use('/comments', commentRoutes) //this has to be before the pizza routes
router.use('/pizzas', pizzaRoutes);


module.exports = router;