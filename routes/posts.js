// PRIVATE ROUTES WITH JWT
const router = require('express').Router();
const verify = require('./verifyToken')

router.get('/', verify, (req, res) => {
    res.json({
        posts: {
            title: 'my first private route',
            description: 'random data you shouldnt access'
        }
    })
})

module.exports = router;