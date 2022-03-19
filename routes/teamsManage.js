const express = require('express')
const router = express.Router()
// middelwares
const {isUser,isAdmin} = require('../middlewares/auth')
const {isEditorTeam,verifyAvailableLists,isUserTeam,isValidatorTeam} = require('../middlewares/teamsAuth')
// services
const Teams = require('../services/teams')
const Lists = require('../services/lists')
const User = require('../services/userService')
const Tasks = require('../services/tasks')
// const {verifyAvailableLists} = require('../middlewares/taskListAuth')

const teamsManage =(app)=>{
    //middleware
    app.use('/teams',router)

    const isEditorTeamAsync = async (req,res,next)=>{
        await isEditorTeam(req,res,next)
    }
    const verifyAvailableListsAsync = async(req,res,next)=>{
        await verifyAvailableLists(req,res,next)
    }
    const isUserTeamAsync=async(req,res,next)=>{
        await isUserTeam(req,res,next)
    }
    const isValidatorTeamAsync=async(req,res,next)=>{
        await isValidatorTeam(req,res,next)
    }


    const TeamsService = new Teams()
    const ListService = new Lists()
    const userService = new User()
    const tasksService = new Tasks()

    //Equipos
    router.get('/',isUser,async(req,res)=>{
        const response = await TeamsService.getTeamsForIdUser(req.userData.id)
        return res.json(response)
    })
    router.post('/create/team',isUser,async(req,res)=>{
        const response = await TeamsService.createTeam(req.userData.id,req.body)
        return res.json(response)
    })



    //miembros
    router.post('/add/member/:idTeam',isUser,async(req,res)=>{
        const {idTeam} = req.params
        const userInfo = await userService.getUserByid(req.body.idUser)
        const response = await TeamsService.addTeamMember(req.userData,idTeam,req.body,userInfo.email)
        return res.json(response)
    })
    router.get('/add/member/confirm/:token',(req,res)=>{
        const {token} = req.params
        const response = TeamsService.confirmAddMember(token)
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



    //listas 
    router.post('/create/teamlist/:idTeam',isUser,isEditorTeamAsync,async(req,res)=>{
        const {idTeam} = req.params
        const response = await ListService.createListVerify(idTeam,req.body)
        return res.json(response)
    })
    
    router.get('/teamlist/:idTeam',isUser,isEditorTeamAsync,async(req,res)=>{
        const lists = await ListService.getListsByTeam(req.params.idTeam)
        return res.json(lists)
    })
    
    router.get('/delete/list/:idTeam',isUser,isEditorTeamAsync,async(req,res)=>{
        const lists = await ListService.delList(req.body.idList)
        return res.json(lists)
    })


    //doble peticion
    router.get('/list/tasks/:idTeam',isUser,isUserTeamAsync,verifyAvailableListsAsync,async(req,res)=>{
        
        const list = await ListService.getListById(req.body.idList)
        const tasks = await tasksService.getTask(req.body.idList,req.userData.id,req.teamMembers,req.teamLeader)
        return res.json({list,tasks})
    })
    router.get('/lists/tasks/:idTeam',isUser,isUserTeamAsync,verifyAvailableListsAsync,async(req,res)=>{
        
        const lists = await ListService.getLists()
        lists.map( (list)=>{

        })
        const tasks = await tasksService.getTask(req.body.idList,req.userData.id,req.teamMembers,req.teamLeader)
        return res.json({lists,tasks})
    })


    //tasks
    router.post('/create/task/:idTeam',isUser,isEditorTeamAsync,verifyAvailableListsAsync,async(req,res)=>{
        const task = await tasksService.createTask(req.body)
        return res.json(task)
    })
    
    router.post('/get/task/:idTeam',isUser,isUserTeamAsync,verifyAvailableListsAsync,async(req,res)=>{
        const task = await tasksService.getTask(req.body.idList,req.userData.id,req.teamMembers,req.teamLeader)
        return res.json(task)
    })
    router.post('/update/task/state/:idTeam',isUser,isValidatorTeamAsync,verifyAvailableListsAsync,async(req,res)=>{
        const response = await tasksService.updateStateOfTask(req.body.idTask)
        return res.json(response)
    })

    router.post('/update/task/member/:idTeam',isUser,isEditorTeamAsync,verifyAvailableListsAsync,async(req,res)=>{
        const {idUser,idTask} = req.body
        const response = await tasksService.addMember(idTask,idUser,req.teamMembers)
        return res.json(response)
    })



    //tareas administrativas
    router.get('/teamlist/lists/:idTeam',isAdmin,async(req,res)=>{
        const lists = await ListService.getListsByTeam(req.params.idTeam)
        return res.json(lists)
    })
    router.get('/all/lists',isAdmin,async(req,res)=>{
        const lists = await ListService.getLists()
        return res.json(lists)
    })
    router.get('/del/list/:idList',isAdmin,async(req,res)=>{
        const lists = await ListService.delList(req.params.idList)
        return res.json(lists)
    })
    //-----------------------------------------


    
}

module.exports= teamsManage