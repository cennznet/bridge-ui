import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Button, ButtonGroup } from "@mui/material";

const Switch: React.FC<{}> = () => {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > *": {
          m: 1,
        },
        marginTop: "20px",
      }}
    >
      <ButtonGroup size="large" aria-label="outlined primary button group">
        <Button
          sx={{ display: "flex" }}
          onClick={() => router.push("/deposit")}
        >
          Deposit
        </Button>
        <Button
          sx={{ display: "flex" }}
          onClick={() => router.push("/withdraw")}
        >
          Withdraw
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default Switch;
