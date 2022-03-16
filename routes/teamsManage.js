const express = require('express')
const router = express.Router()
const {isUser,isAdmin} = require('../middlewares/auth')
// const {isEditorTeam} = require('../middlewares/teamsAuth')
const Teams = require('../services/teams')
const Lists = require('../services/lists')
const teamsManage =(app)=>{
    //middleware
    app.use('/teams',router)

    const TeamsService = new Teams()
    const ListService = new Lists()

    router.get('/',isUser,async(req,res)=>{
        const response = await TeamsService.getTeamsForIdUser(req.userData.id)
        return res.json(response)
    })
    router.post('/create/team',isUser,async(req,res)=>{
        const response = await TeamsService.createTeam(req.userData.id,req.body)
        return res.json(response)
    })
    router.post('/add/member/:idTeam',isUser,async(req,res)=>{
        const {idTeam} = req.params
        const response = await TeamsService.addTeamMember(req.userData,idTeam,req.body)
        return res.json(response)
    })
    router.post('/update/member/:idTeam',isUser,async(req,res)=>{
        const {idTeam} = req.params
        const response = await TeamsService.updateMemberRol(req.userData,idTeam,req.body)
        return res.json(response)
    })
    router.post('/delete/member/:idTeam',isUser,async(req,res)=>{
        const {idTeam} = req.params
        const response = await TeamsService.deleteMember(req.userData,idTeam,req.body)
        return res.json(response)
    })



    //routes listas 
    router.post('/create/teamlist/:idTeam',isUser,async(req,res)=>{
        const {idTeam} = req.params
        const response = await ListService.createListVerify(idTeam,req.body)
        return res.status(200).json(response)
    })
    
  
    router.get('/teamlist/:idTeam',isUser,async(req,res)=>{
        const lists = await ListService.getListsByTeamUserVerify(req.params.idTeam,req.userData.id)
        return res.status(200).json(lists)
    })

    // FIXME:
    router.get('/teamlist/lists/:idTeam',isAdmin,async(req,res)=>{
        const lists = await ListService.getListsByTeam(req.params.idTeam)
        return res.status(200).json(lists)
    })
    router.get('/all/lists',isAdmin,async(req,res)=>{
        const lists = await ListService.getLists()
        return res.status(200).json(lists)
    })
    router.get('/del/list/:idList',isAdmin,async(req,res)=>{
        const lists = await ListService.delList(req.params.idList)
        return res.status(200).json(lists)
    })
    router.post('/create/task/:idList',isUser,async(req,res)=>{
        const {idList} = req.params
        // TODO:
        // crear tarea a partir del id de la lista
        // y el id del usuario
        return res.status(200).json({message:"algo"})
    })
    
}

module.exports= teamsManage