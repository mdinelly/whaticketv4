import React, { useState, useEffect,forwardRef } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import Typography from "@material-ui/core/Typography";
import { Button } from "@material-ui/core";

import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import subDays from "date-fns/subDays";
import "react-datepicker/dist/react-datepicker.css";

import Chart from "./Chart";
import ChartPerUser from "./ChartPerUser";
import ptBR from 'date-fns/locale/pt-BR';
import useTickets from "../../hooks/useTickets";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import StatusSelect from "../../components/StatusSelect";
import SetorSelect from "../../components/SetorSelect";
import AtendenteSelect from "../../components/AtendenteSelect";
import ChartPerQueue from "./ChatPerQueue";

const useStyles = makeStyles(theme => ({

	container: {
		paddingTop: theme.spacing(4),
		paddingBottom: theme.spacing(4),
	},
	fixedHeightPaper: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		height: 250,
	},
	fixedHeightPaperFilter: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		height: 90,
		backgroundColor: "#E5E5E5",
		alignItems: "center",
	},
	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
		alignItems: "center",
	},
	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
	},
}));

const Dashboard = () => {
	registerLocale('pt-BR', ptBR);
	setDefaultLocale('pt-BR');
	const classes = useStyles();
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(new Date());
	const [users, setUsers] = useState([]);
	const [queues, setQueues] = useState([]);

	const [setorSelected, setSetorSelected] = useState(999);
	const [atendenteSelected, setAtendenteSelected] = useState(999);
	const [statusSelected, setStatusSelected] = useState("all");

	const { tickets } = useTickets({ date: startDate.toISOString(), endDate: endDate.toISOString(), status: statusSelected, atendenteId: atendenteSelected, setorId: setorSelected });

	const CustomInputDate = forwardRef(({ value, onClick }, ref) => (
		<Button variant="contained"	color="secondary" onClick={onClick} ref={ref}>
			{value}
		</Button>
	));

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const { data } = await api.get("/users");
				//console.log('USRS => ', data.users);
				setUsers(data.users);
			} catch (err) {
				toastError(err);
			}
		};
		fetchUsers();
	}, []);

	useEffect(() => {
		const fetchQueues = async () => {
			try {
				const { data } = await api.get("/queue");
				//console.log('QUEUES => ', data);
				setQueues(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchQueues();
	}, []);

	return (
		<div className={classes.root}>
			<Container maxWidth="lg" className={classes.container}>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Paper className={classes.fixedHeightPaperFilter}>
							<div className={classes.multFieldLine} >
								<div>
									{/*<Typography variant="body1">
										{i18n.t("dashboard.dtinicial")}
									</Typography>*/}
									<DatePicker
										title={i18n.t("dashboard.dtinicial")}
										selected={startDate}
										dateFormat="dd/MM/yyyy"
										onChange={(date) => setStartDate(date)}
										locale="pt-BR"
										customInput={<CustomInputDate />}
										minDate={subDays(new Date(), 30)}
										maxDate={new Date()}
									/>
								</div>
								<div>
									{/*<Typography variant="body1">
										{i18n.t("dashboard.dtfinal")}
									</Typography>*/}
									<DatePicker
										title={i18n.t("dashboard.dtfinal")}
										selected={endDate}
										dateFormat="dd/MM/yyyy"
										onChange={(date) => setEndDate(date)}
										locale="pt-BR"
										customInput={<CustomInputDate />}
										minDate={subDays(new Date(), 30)}
										maxDate={new Date()}
									/>
								</div>
								<StatusSelect selected={statusSelected} onChange={(value) => setStatusSelected(value)} />
								<SetorSelect selected={setorSelected} onChange={(value) => setSetorSelected(value)} />
								<AtendenteSelect selected={atendenteSelected} onChange={(value) => setAtendenteSelected(value)} />
							</div>
						</Paper>
					</Grid>
				</Grid>

				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Paper className={classes.fixedHeightPaper}>
							<Chart tickets={tickets} />


						</Paper>
					</Grid>
				</Grid>

				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Paper className={classes.fixedHeightPaper}>
							<div className={classes.multFieldLine} style={{ width: '100%', height: 210 }} overflow={'hidden'} >
								<div style={{ width: '80%', height: 210 }}>
									<ChartPerUser tickets={tickets} users={users} />
								</div>
								<div style={{ width: '20%', height: 210 }}>
									<ChartPerQueue tickets={tickets} queues={queues} />
								</div>
							</div>
						</Paper>
					</Grid>
				</Grid>
			</Container>
		</div>
	);
};

export default Dashboard;
