const express = require('express');
const multer = require('multer');
const fs = require('fs')

const app = express();

const livro = require('../model/Livro');
const { Router } = require('express');
const router = express.Router();

/******* MULTER - STORAGE ******/
/** GERENCIA O ARMAZENAMENTO DOS ARQUIVOS **/

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString() + '_' + file.originalname);
    }   

});

/******* MULTER - FILTER ******/
/** GERENCIA O TIPO DE ARQUIVO QUE PPDE SER RECEBIDO **/
const fileFilter = (req, file, cb)=> {

    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' ){
        cb(null, true);

    }else{
        cb(null, false);

    }

}


/******* MULTER -  UPLOAD ******/
/** EXECUTA O PROCESSO DE ARMAZENAMENTO **/
const upload = multer({
    storage: storage,
    limits:{ fileSize: 1024 * 1024 * 5},
    fileFilter: fileFilter

});




router.post('/livro/cadastrarLivro', upload.array('files', 2), (req, res)=>{

        console.log(req.files[0]);
        console.log(req.files[1]);
        console.log(req.body);

        const {titulo, preco, detalhes, tblCategoriaumId} = req.body;
        const imagem_peq = req.files[0].path;
        const imagem_grd = req.files[1].path;
        
        livro.create(
            {
                titulo,
                preco,
                imagem_peq,
                imagem_grd,
                detalhes,
                tblCategoriaumId

            }
        
        ).then(             
                ()=> 
                { 
                    res.send('DADOS DE LIVRO INSERIDOS COM SUCESSO!')
                }
        );
    });

    router.get('/livro/listarLivro', (req, res)=>{
        livro.findAll()
            .then((livros)=>{
                res.send(livros)
            });
    });

    router.get('/livro/listarLivroCodigo/:id', (req, res)=>{

        const { id } = req.params;

        livro.findByPk(id)
            .then((livrosId)=>{
                res.send(livrosId)
            });
    });

    router.delete('/livro/excluirLivro/:id', (req, res)=>{

    const { id } = req.params;

    livro.findByPk(id)
    .then((livro)=>{

        let imagem_grd = livro.imagem_grd;
        let imagem_peq = livro.imagem_peq;

        livro.destroy({
            where:{ id }
        }).then(
            ()=>{
                
                // Exclusão da imagem pequena
                fs.unlink(imagem_peq, (error)=>{
                    if(error){
                        console.log('Erro ao excluir a imagem: ' + error)
                    }else{
                        console.log('Imagem excluida pequena com sucesso! ')
                    }
                });

                /*Exclusão da imagem grande  */
                fs.unlink(imagem_grd, (error)=>{
                    if(error){
                        console.log('Erro ao excluir a imagem: ' + error)
                    }else{                            
                        console.log('Imagem excluida grande com sucesso! ')
                    }
                });

                res.send('DADOS DE LIVROS EXCLUÍDOS COM SUCESSO!')
            });
        });
    });

    router.put('/livro/editarLivro', upload.array('files', 2), (req, res)=>{

        const { titulo, preco, detalhes, tblCategoriaumId, id } = req.body;

        /** Update com Imagem **/
            if(req.files != ''){
                
                livro.findByPk(id)
                .then((livro)=>{

                    let imagem_peq = livro.imagem_peq;
                    let imagem_grd = livro.imagem_grd;

                     // Exclusão da imagem pequena
                     fs.unlink(imagem_peq, (error)=>{
                        if(error){
                            console.log('Erro ao excluir a imagem: ' + error)
                        }else{
                            console.log('Imagem excluida pequena com sucesso! ')
                        }
                    });

                    /*Exclusão da imagem grande  */
                    fs.unlink(imagem_grd, (error)=>{
                        if(error){
                            console.log('Erro ao excluir a imagem: ' + error)
                        }else{                            
                            console.log('Imagem excluida grande com sucesso! ')
                        }
                    });

                    imagem_peq = req.files[0].path;
                    imagem_grd = req.files[1].path;

                    /** ATUALIZAÇÃO DOS DADOS DE LIVRO **/
                    livro.update(
                        {titulo,
                        preco,
                        imagem_peq,
                        imagem_grd,
                        detalhes,
                        tblCategoriaumId},
                        {where: {id}}
                    ).then(
                        ()=>{res.send('DADOS DE LIVROS ALTERADOS COM SUCESSO!')}
                        );                    

                });
            }else{
                /** Update sem Imagem **/
            livro.update(
            {titulo,
            preco,
            detalhes,
            tblCategoriaumId},
            {where: {id}}
        ).then(
            ()=>{res.send('DADOS DE LIVROS ALTERADOS COM SUCESSO!')}
            );

        }



        
    });
    
module.exports = router;