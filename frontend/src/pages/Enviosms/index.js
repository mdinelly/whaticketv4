import React, { useEffect, useState } from "react";
import { i18n } from "../../translate/i18n";
import openSocket from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { green } from "@material-ui/core/colors";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import BotModal from "../../components/CommandModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import MenuModal from "../../components/MenuModal";
import {
	Button,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	Table,
	TableHead,
	Tooltip,
	CircularProgress,
} from "@material-ui/core";
import {

	CheckCircle,
	SignalCellularConnectedNoInternet2Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellular4Bar,
	CropFree,
} from "@material-ui/icons";



const http = require('http');

const init = {
  host: 'localhost',
  path: '/enviosms',
  port: 8080,
  method: 'POST',
  headers: {
    'content-type': 'application/json; charset=utf-8'
  }
};

const callback = function(response) {
  let result = Buffer.alloc(0);
  response.on('data', function(chunk) {
    result = Buffer.concat([result, chunk]);
  });
  
  response.on('end', function() {
    console.log(result.toString());
  });
};

async function ZDGSender(number, message, iD) {
	const req = http.request(init, callback);
	const body = '{"number":"'+ number + '@c.us","message":"' + message.replace(/\n/g, "\\n") + '","ticketwhatsappId":' + iD + '}';
	await req.write(body);
	req.end();
}

const init2 = {
	host: 'localhost',
	port: 8080,
	path: '/whatsappzdg'
  };
  
async function GETSender() {
	http.get(init2, function(res) {
		res.on("data", function(wppID) {
		  alert("ID instância ativa: " + wppID) ;
		});
	  }).on('error', function(e) {
		alert("Erro: " + e.message);
	  });
}

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(4)
	},

	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
	},

	settingOption: {
		marginLeft: "auto",
	},
	margin: {
		margin: theme.spacing(1),
	},
}));

const ZDG = () => {
	const classes = useStyles();
	const [inputs, setInputs] = useState({});

	const handleChange = (event) => {
		const name = event.target.name;
		const value = event.target.value;
		setInputs(values => ({...values, [name]: value}))
	  }
	
	const handleSubmit = (event) => {
		event.preventDefault();
		alert('As mensagens estão sendo carregadas! Aguarde...');
		const usersTextArea = inputs.user.split('\n');
		usersTextArea.forEach((user) => {
			setTimeout(function() {
				ZDGSender(user, inputs.message, inputs.id);
				alert('Mensagem enviada para o número: ' + user);
				},5000 + Math.floor(Math.random() * 10000))            
		  });
	}
	
	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);
		return () => {
			socket.disconnect();
		};
	}, []);

	return (
		<div className={classes.root}>
			<Container className={classes.container} maxWidth="sm">
			<form onSubmit={handleSubmit}>
				<label>Números:<br/>
			<Paper className={classes.paper}>
			    <textarea
			style={{ color:"white", backgroundColor:"#e8e8e8", borderColor:"#004842", borderRadius: "4px", padding: "15px" }}		
					name="user" 
					cols="80" 
					rows="10"
					value={inputs.user || ""} 
					onChange={handleChange}
					required="required"
					placeholder="5527992633735&#13;&#10;5527992633735&#13;&#10;5527992633735&#13;&#10;5527992633735"
			     />
			</Paper>
			
				</label><br/><br/>.
				<label>Mensagem<br/>
			    <Paper className={classes.paper}>
			    <textarea
			  style={{ color:"white", backgroundColor:"#e8e8e8", borderColor:"#004842", borderRadius: "4px",  padding: "15px" }}
					name="message" 
					cols="80" 
					rows="10"
					value={inputs.message || ""} 
					onChange={handleChange}
					required="required"
					placeholder="Olá, tudo bem?&#13;&#10;Como posso te ajudar?&#13;&#10;Abraços, a gente se vê!"
			    />
			    </Paper>

				</label><br/><br/>
				<label>ID do WhatsApp Disparador<br/>
				<Paper className={classes.paper}>
			    <input
				    style={{ color:"white", backgroundColor:"#e8e8e8", borderColor:"#004842", borderRadius: "4px", padding: "10px" }}
					type="text" 
					name="id" 
					value={inputs.id || ""} 
					onChange={handleChange}
					required="required"
				    placeholder="ID, Na Guia Conexões!"
				/>
			    </Paper>
				
				</label><br/><br/>	
			    <input
				style={{ color:"white", backgroundColor:"#004842", borderColor:"#004842", borderRadius: "4px", padding: "10px" }}
				type="submit" 
				value="Iniciar Envio Automatico"
				/>
				
			</form>
			</Container>
		</div>
	);
};

export default ZDG;