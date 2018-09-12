const express = require('express');
const router = express.Router();
const jwt = require('../../module/jwt.js');
const pool = require('../../module/pool.js');

//장소 조회
router.get('/', async (req, res) => {

    const ID = jwt.verify(req.headers.authorization);

    const getPlaceQuery = 'SELECT * FROM place';

    let getPlaceInfo = await pool.execute2(getPlaceQuery);

    if (!getPlaceInfo) {
        res.status(500).send({
            message: "Internel Server Error",
            data: null
        })
    }
    else {
        res.status(200).send({
            message: "Successful Get Stamp Status Data",
            data: getPlaceInfo
        });
    }

});

//장소 조회
router.get('/:place_id', async (req, res) => {

    const ID = jwt.verify(req.headers.authorization);
    const place_id = req.params.place_id;

    const getPlaceQuery = 'SELECT * FROM place where place_id = ?';

    let getPlaceInfo = await pool.execute2(getPlaceQuery, place_id);

    if (!getPlaceInfo) {
        res.status(500).send({
            message: "Internel Server Error",
            data: null
        })
    }
    else {
        res.status(200).send({
            message: "Successful Get Stamp Status Data",
            data: getPlaceInfo
        });
    }

});

//장소의 댓글들 조회
router.get('/:place_id/comments', async (req, res) => {

    //const ID = jwt.verify(req.headers.authorization);
    let ID = 2;
    const place_id = req.params.place_id;

    const getPlaceQuery = 'SELECT * FROM comment WHERE place_id = ? ORDER BY comment_id DESC';
    const getMyComment = 'SELECT c.*, w.writer_name FROM comment c JOIN writer w ON c.writer_id = w.writer_id WHERE c.place_id = ? AND c.writer_id = ?'
    const getMyStamp = 'SELECT * FROM stamp WHERE place_id = ? AND writer_id = ?'
    const getUser = 'SELECT * FROM writer WHERE writer_id = ?';

    let object = {};
    let getPlaceInfo = await pool.execute2(getPlaceQuery, place_id);

    //로그인을 했을 경우
    if (ID != -1) {
        let user = await pool.execute2(getUser, ID);
        let myComment = await pool.execute3(getMyComment, place_id, ID);
        let myStamp = await pool.execute3(getMyStamp, place_id, ID);

        //스탬프를 안 찍었을 경우
        if (myStamp.length == 0) {
            object.message = user[0].writer_name + "님 평가해 주세요."
            object.status = "스탬프를 먼저 찍어주세요"
            object.myComment = null;
        }
        //스탬프를 찍었을 경우
        else {
            //댓글을 안 달았을 경우
            if(myComment.length == 0) {
                object.message = user[0].writer_name + "님 평가해 주세요."
                object.status = "별점을 평가해 주세요."
                object.myComment = null;
            }
            //댓글을 달았을 경우
            else {
                object.message = null
                object.status = null
                object.myComment = myComment
            }
        }

    }
    //로그인을 하지 않았을 경우
    else {
        object.message = "로그인 해주세요."
        object.status = "로그인 해주세요."
    }

    object.comments = getPlaceInfo;

    if (!getPlaceInfo) {
        res.status(500).send({
            message: "Internel Server Error",
            data: null
        })
    }
    else {
        res.status(200).send({
            message: "Successful Get Comment Data",
            data: object
        });
    }

});

module.exports = router;