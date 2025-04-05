import { Box, Typography, TextField, Paper } from "@mui/material";

const AutoQuestionUI = () => {
  const topicName = "Thermodynamics";
  const subjects = ["Physics", "Chemistry", "Zoology", "Maths", "Botany"];

  return (
    <Box
      sx={{
        backgroundColor: "#e0f0ff",
        padding: 2,
        borderRadius: 2,
        marginTop: 3,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          padding: 3,
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          {topicName}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {subjects.map((subject) => (
            <Box
              key={subject}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #ddd",
                borderRadius: 2,
                px: 2,
                py: 1,
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>{subject}</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="0"
                inputProps={{ min: 0 }}
              />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default AutoQuestionUI;
