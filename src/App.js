import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import ToolBar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Box, TextField, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DataGrid } from '@mui/x-data-grid';
import './App.css';

const useStyles = makeStyles(theme => ({
  appBarSpacer: {
    marginTop: 45
  }
}))

function App() {
  const classes = useStyles();
  const [coins, setCoins] = useState([]);
  const [displayedCoins, setDisplayedCoins] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchName, setSearchName] = useState('');
  const [coinsFiltered, setCoinsFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const dataPerPage = 10;
  const columns = [
    { field: "symbol", headerName: "Symbol", flex: 1},
    { field: "name", headerName: "Name", flex: 1},
    { field: "current_price", headerName: "Current Price", flex: 1}
  ]
  const searchCoin = () => {
    setCoinsFiltered(coins.filter((coin) => coin.name.toLowerCase().includes(searchName.toLowerCase())));
    setCurrentPage(0);
  }
  useEffect(() => {
    setLoading(true);
    axios.get("https://api.coingecko.com/api/v3/coins/list")
    .then((resp) => {
      setCoins(resp.data);
      setCoinsFiltered(resp.data);
    })
    .catch((err) => {
      console.log(err)
      setDataError(true);
    })
  }, [])

  useEffect(() => {
    setDataError(null);
    setLoading(true);
    const startPos = currentPage * dataPerPage;
    const endPos = startPos + dataPerPage;
    const coinIds = coinsFiltered.slice(startPos, endPos).map((coin) => coin.id)
    axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=id_asc&per_page=10&page=1&sparkline=false&price_change_percentage=7d&ids=${coinIds.join(",")}`)
    .then((resp) => {
      // timeout to show the loading indicator more clearly
      setTimeout(() => {
        setDisplayedCoins(resp.data);
        setLoading(false);
      }, 1000)
    })
    .catch((err) => {
      setDataError(true);
    })
  }, [coins, currentPage, coinsFiltered])

  const dataGridPageChange = (e) => {
    setCurrentPage(e);
  }

  return (
    <div className="App">
      <AppBar >
          <ToolBar>
            <Typography variant="h6" component="div">
              CoinLizard
            </Typography>
          </ToolBar>
        </AppBar>
        <div className={classes.appBarSpacer}></div>
      <Grid padding={5} rowSpacing={5} container justifyContent="center" alignItems="center">
          <Grid item container spacing={3} xs={12}>
            <Grid item xs={10}>
              <TextField inputProps={{"data-testid":"searchTxtField"}} placeholder={"Input Coin name"} fullWidth onChange={(e) => setSearchName(e.currentTarget.value)}/>
            </Grid>
            <Grid item xs={2}>
              <Button data-testid="searchBtn" fullWidth style={{height:"100%"}} variant="contained" onClick={searchCoin}>Search</Button>
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ height: 400}}>
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{ flexGrow: 1 }}>
                <DataGrid pagination paginationMode="server" rowCount={coinsFiltered.length} columns={columns} rows={displayedCoins}
                  onPageChange={dataGridPageChange} rowsPerPageOptions={[10]} pageSize={dataPerPage} loading={loading} error={dataError}
                  autoHeight/>
              </div>
            </div>
          </Grid>
      </Grid>
    </div>
  );
}

export default App;
