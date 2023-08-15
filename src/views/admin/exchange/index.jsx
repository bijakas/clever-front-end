
import CurrencyInput from 'react-currency-input-field';
import {
  Box,
  Flex,
  FormLabel,
  Select,
  SimpleGrid,
  Button,
  Stack,
  FormControl,
  Input,
  Text,
  Tbody,
  TableContainer,
  Thead,
  Tr,
  Th,
  Td,
  Table

} from "@chakra-ui/react";
import Card from "components/card/Card.js";
// Assets
// Custom components
import React from "react";
import {
} from "react-icons/md";
import {
} from "views/admin/default/variables/columnsData";
import { useState, useEffect } from "react";
import showToast from "Utils";
import { useQueries } from "@tanstack/react-query";

import axios from 'axios';
import swal from 'sweetalert';

export default function Exchange() {

  // Chakra Color Mode
  const hostAddress = localStorage.getItem('host');

  const [bankInfo] = useQueries({
    queries: [
      {
        refetchInterval: 4000,
        queryKey: ['bankInfoKey'],
        queryFn: () =>
          axios
            .get(`${hostAddress}/bank-info`)
            // .get(`http://localhost:8080/v2/bank-info`)
            .then((res) => res.data),
      },
    ],
  });

  const [amount, setAmount] = useState(0);
  const [currencyDest, setCurrencyDest] = useState("");
  const [currencySource, setCurrencySource] = useState("");
  const [feeObject, setFeeObject] = useState({});


  useEffect(() => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        "amount": Number(amount.toString().replace(",", "")),
        "currencySource": currencySource,
        "currencyDest": currencyDest
      })
    };
    fetch(`${hostAddress}/calculate-transaction`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log('calculate-transaction');
        console.log('res', console.log(result));
        setFeeObject(result)
      })
      .catch(error => {
        console.log('error', error);
      });
    console.log('uE')
  }, [amount, currencySource, currencyDest, hostAddress]);
  const currencyPair = currencySource !== "" && currencyDest !== "" ? currencySource + "/" + currencyDest : "";
  const sendExchangeRequest = () => {

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      body: JSON.stringify({
        "amount": Number(amount.replace(",", "")),
        "currencySource": currencySource,
        "currencyDest": currencyDest
      })
    };
    fetch(`${hostAddress}/exchange`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log('res', console.log(result));
        setAmount(0);
      })
      .catch(error => {
        console.log('error', error);
        // showToast("transaksi issuance gagal dilakukan");
      });
  }

  const getTableRateComponents = (bankInfo) => {
    if (bankInfo.isLoading) return 'Loading data...';
    if (bankInfo.error) { return 'service temporarily not available'; }
    return <TableContainer>

      <Table size='sm'>
        <Thead>
          <Tr>
            <Th>Pair</Th>
            <Th>Price</Th>
          </Tr>
        </Thead>
        <Tbody>
          {bankInfo.data.rate.map((rate) =>
            <Tr>
              <Td>{rate.pair}</Td>
              <Td>{rate.price}</Td>
            </Tr>

          )}
        </Tbody>
      </Table>
    </TableContainer>
  }

  const getRateInfoComponents = (bankInfo) => {
    if (bankInfo.isLoading) return 'Loading data...';
    if (bankInfo.error) { return 'service temporarily not available'; }
    return <Text fontSize={{ sm: "xl", lg: "xl", xl: "xl" }} fontWeight='bold'>
      {bankInfo.data.rate.filter(function (obj) {
        return obj.pair === currencyPair;
      }).map((rate) =>
        <>{rate.fee}</>
      )}
    </Text>
  }


  const handleSubmit = (event) => {
    event.preventDefault();
    if (currencySource === "" || currencyDest === "" || amount <= 0 || amount === "") {
      // showToast("Please enter amount, destination currency, & target currency", "error");
      swal("Please enter amount, destination currency, & target currency", {
        icon: "warning",
      });
    }
    else if (currencySource === currencyDest) {
      // showToast("Destination currency and target currency cannot same", "error");
      swal("Destination currency and target currency cannot same", {
        icon: "warning",
      });
    }
    else {
      sendExchangeRequest()
      swal("Exchage request is successfull", {
        icon: "success",
      });
      // showToast("Exchage request is successfull");
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 2, "2xl": 2 }}
        gap='20px'
        mb='20px'>
        <Card>
          {getTableRateComponents(bankInfo)}
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
        <Card>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl mr="5%" isRequired>
                <FormLabel htmlFor="first-name" fontWeight={'normal'}>
                  Exchange Amount
                </FormLabel>
                <Flex align={'stretch'}>
                  <Input as={CurrencyInput}
                    mr={"5px"} minW={"45%"}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Flex>
                <Flex align={'stretch'} mt="5px">
                  <FormLabel htmlFor="first-name" fontWeight={'normal'}>
                    From
                  </FormLabel>
                  <Select defaultValue={""} mr={"5px"} onChange={(e) => setCurrencySource(e.target.value)}>
                    <option value='' ></option>
                    <option value='INR' >INR</option>
                    <option value='IDR' >IDR</option>
                    <option value='SGD' >SGD</option>
                  </Select>

                  <FormLabel htmlFor="first-name" fontWeight={'normal'}>
                    To
                  </FormLabel>
                  <Select defaultValue={""} mr={"5px"} onChange={(e) => setCurrencyDest(e.target.value)}>
                    <option value='' ></option>
                    <option value='INR' >INR</option>
                    <option value='IDR' >IDR</option>
                    <option value='SGD' >SGD</option>
                  </Select>
                </Flex>
              </FormControl>
              <FormControl mr="5%">
                <TableContainer>
                  <Table size='sm'>
                    <Tbody>
                      <Tr>
                        <Td>Exchange Fee</Td>
                        <Td>: {currencyPair}</Td>
                      </Tr>
                      <Tr>
                        <Td>Rate</Td>
                        <Td>: {feeObject.rate}</Td>
                      </Tr>
                      <Tr>
                        <Td>Total Received</Td>
                        <Td>: {feeObject.totalReceived}</Td>
                      </Tr>
                      <Tr>
                        <Td>Total Fee</Td>
                        <Td>: {feeObject.totalFeeAmount}</Td>
                      </Tr>
                      <Tr>
                        <Td>Fee % </Td>
                        <Td>: {feeObject.feePercentage}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
                {/* <Input id="first-name" defaultValue= {"IDR 1000.000.000,00"} readOnly /> */}
                {getRateInfoComponents(bankInfo, currencyPair)}
              </FormControl>
              <Flex align={"start"}>
                <Button colorScheme='blue' type="submit">Exchange</Button>
              </Flex>
            </Stack>
          </form>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
