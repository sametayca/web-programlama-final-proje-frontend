import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  Typography,
  Chip
} from '@mui/material'

const WeeklySchedule = ({ schedule }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = ['09:00', '11:00', '13:00', '15:00']

  const getCourseAtTime = (day, time) => {
    return schedule.find(
      (course) => course.day === day && course.startTime === time
    )
  }

  const dayTranslations = {
    Monday: 'Pazartesi',
    Tuesday: 'Salı',
    Wednesday: 'Çarşamba',
    Thursday: 'Perşembe',
    Friday: 'Cuma'
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
              Saat
            </TableCell>
            {days.map((day) => (
              <TableCell 
                key={day} 
                align="center"
                sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}
              >
                {dayTranslations[day]}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {timeSlots.map((time) => (
            <TableRow key={time} hover>
              <TableCell 
                sx={{ 
                  bgcolor: 'grey.100', 
                  fontWeight: 'bold',
                  minWidth: 80
                }}
              >
                {time}
              </TableCell>
              {days.map((day) => {
                const course = getCourseAtTime(day, time)
                return (
                  <TableCell 
                    key={`${day}-${time}`}
                    align="center"
                    sx={{ 
                      p: 1,
                      minWidth: 150,
                      verticalAlign: 'top'
                    }}
                  >
                    {course ? (
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: 'primary.light',
                          color: 'white',
                          minHeight: 100,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {course.courseCode}
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 0.5 }}>
                          {course.courseName}
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 0.5 }}>
                          {course.instructorName}
                        </Typography>
                        <Chip 
                          label={course.classroomName || course.building}
                          size="small"
                          sx={{ 
                            mt: 0.5, 
                            height: 20, 
                            fontSize: '0.7rem',
                            bgcolor: 'rgba(255,255,255,0.3)'
                          }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ p: 2, color: 'text.disabled' }}>-</Box>
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default WeeklySchedule

