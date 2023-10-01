const {Router} = require('express');
const router = Router();
const mongoose = require('mongoose');
const { Sampling_Place } =  require('../models/sampling_places');
const { Chemical_Index } =  require('../models/chemical_index');
const { Places } =  require('../models/places');
require('dotenv').config();


/*--------------------------------------------------------------------------------------------------------------------------------*/

// GET chapter


router.get('/api/places', async (req, res) => {
  try {
    const places = await Places.find(); // Отримайте всі записи з колекції "place"
    res.json(places); // Відправте дані на сторінку React у форматі JSON
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/api/sampling_places', async (req, res) => {
    try {
      const sampling_place = await Sampling_Place.find(); // Отримайте всі записи користувачів з MongoDB
      res.json(sampling_place); // Відправте дані на сторінку React у форматі JSON
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

router.get('/api/chemical-indexes', async (req, res) => {
    try{
        const chemical_index = await Chemical_Index.find();
        res.json(chemical_index);
    }
    catch(error){
        console.log('Error fetching chemical_index:', error);
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/api/edit-sampling-places/:id', async (req, res) =>{
  try{
    const id = req.params.id
    const sampling_place = await Sampling_Place.findById(id);
    res.json(sampling_place);
  }catch(err){
    console.log('Error with found data in "sampling_places"', err);
    res.status(500).send('Internal server error');
  }
})


router.get('/api/edit-chemical-indexes/:id', async (req, res) =>{
  try{
    const id = req.params.id
    const chemical_index = await Chemical_Index.findById(id);
    res.json(chemical_index);
  }catch(err){
    console.log('Error with found data in "chemical_index"', err);
    res.status(500).send('Internal server error');
  }
})


/*----------------------------------------------------------------------------------------------------------------------------*/

//POST

router.post('/api/add-sampling-place', async (req, res) => {
    try {
      // Отримання даних з форми
      const { region, name_place, type_water_object, name_water_object, longitude, latitude, comment } = req.body;
      const errors = [];


        if(!region || !name_place || !type_water_object || !name_water_object || !longitude || !latitude){
          errors.push('Require always field except country and commentar must be field');
        }
        
        const SamplingplacesCount = await Sampling_Place.find({
          $or: [
            { longitude: longitude, latitude: latitude},
            { name_place: name_place }
          ]
        }).count();


        if(SamplingplacesCount > 0){
          errors.push('Detected duplicate data!');
        }

        const regexLongitude= /^(-)?(([0-8]?[0-9])(\.\d{1,6})?)$|90$/
        const regexLatitude= /^(-)?((1?[0-7]?[0-9])(\.\d{1,6})?)$|180$/
    
        if(!regexLongitude.test(longitude) || !regexLatitude.test(latitude)){
          errors.push({ status: 400, message: `Incorrect enter data coordinate ${longitude} or ${latitude}` });
        }
    

        if (errors.length > 0) {
          return res.status(400).json({ errors });
        }

  
      // Створення нового зразка місця
      const newSamplingPlace = new Sampling_Place({
        region,
        name_place,
        type_water_object,
        name_water_object,
        longitude,
        latitude,
        comment
      });
  
      // Збереження зразка місця до бази даних
      const savedSamplingPlace = await newSamplingPlace.save();
  
      // Відправка відповіді про успішне збереження
      res.status(200).json({ success: true, message: 'Sampling place saved successfully!' });
    } catch (error) {
      // Обробка помилок
      console.error('Error saving sampling place:', error);
      res.status(500).json({ success: false, message: 'Failed to save sampling place.', error: error });
    }
  });

 
  router.post('/api/add-chemical-index', async (req, res) => {
    try{
        const {name_place, chemical_index, result_chemical_index, date_analysis, comment}= req.body
    
        const newChemicalIndex = new Chemical_Index({
            name_place,
            chemical_index,
            result_chemical_index,
            date_analysis, 
            comment
        })
        const savedChemicalIndex = await newChemicalIndex.save();
        res.status(200).json({ success: true, message: 'Chemical index saved successfully!'})
    }catch(error){
        conseol.log('Error saving chemical index:', error);
        res.status(500).json({success: false, message: 'Failed to save chemical index.'})
    }
  });


/*--------------------------------------------------------------------------------*/

//PUT
router.put('/api/edit-sampling-places/:id/update', async (req, res) => {
  try {
    const id = req.params.id;
    const newData = req.body;
    const errors = [];

    // Отримуємо старе значення sampling_place з бази даних sampling_places
    const oldSamplingPlace = await Sampling_Place.findById(id);

    //Перевірка на дублікати
    const otherSamplingplacesCount = await Sampling_Place.find({
      $or: [
        { longitude: newData.longitude, latitude: newData.latitude, _id: { $ne: id } },
        { name_place: newData.name_place, _id: { $ne: id } }
      ]
    }).count();

    if(otherSamplingplacesCount > 0){
      errors.push({ status: 400, message: 'Detected duplicate data!' });
    }


    const regexLongitude= /^(-)?(([0-8]?[0-9])(\.\d{1,6})?)$|90$/
    const regexLatitude= /^(-)?((1?[0-7]?[0-9])(\.\d{1,6})?)$|180$/

    if(!regexLongitude.test(newData.longitude) || !regexLatitude.test(newData.latitude)){
      errors.push({ status: 400, message: `Incorrect enter data coordinate ${newData.longitude} or ${newData.latitude}` });
    }

    if(!newData.region || !newData.name_place || !newData.type_water_object || 
      !newData.name_water_object || !newData.longitude || !newData.latitude){
        errors.push({ status: 400, message: 'Not all fields were inserted!' });
    }


    if (errors.length > 0) {
      console.log('Count errors:', errors.length, 'Name errors:', errors);
      return res.status(400).json({ errors });
    }

    // Оновлюємо дані у колекції Sampling_Place
    const updatedSamplingPlace = await Sampling_Place.findByIdAndUpdate(id, newData, { new: true });

    // Оновлюємо дані в колекції Chemical_Index, де відбувається співпадіння старого name_place
    await Chemical_Index.updateMany({ name_place: oldSamplingPlace.name_place }, { $set: { name_place: newData.name_place } });
    res.status(200).json(updatedSamplingPlace);
  } catch (err) {
    console.log('Error with found data in "sampling_places"', err);
    res.status(500).send('Internal server error');
  }
});


router.put('/api/edit-chemical-indexes/:id/update', async (req, res) => {
    try{
      const id = req.params.id;
      const newData = req.body;
      const errors = [];
      console.log('newData', newData);

      if(!newData.name_place || !newData.chemical_index || newData.result_chemical_index === "" || 
        newData.date_analysis === ""){
          errors.push({ status: 400, message: 'Not all fields were inserted!' });
      }

      const regexResultAnalysis = /^(\d+(\.\d{1,4})?)?$/;
      if(!regexResultAnalysis.test(newData.result_chemical_index)){
        errors.push({status: 400, message: 'Error format enter data in filed result_chemical_index (3, 3.10 3.3003)'});
      }

      const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
      const matches = newData.date_analysis.match(dateRegex);

      if (matches && matches.length === 4) {
        if(matches) {
          const day = parseInt(matches[1], 10);
          const month = parseInt(matches[2], 10);
          const year = parseInt(matches[3], 10);
          // Перевірка валідності дати
          if (month >= 1 && month <= 12) {
            const maxDaysInMonth = new Date(year, month, 0).getDate();
            if (day >= 1 && day <= maxDaysInMonth) {
              // Перевірка на високосний рік
              const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
              if (month === 2 && day > 29 && !isLeapYear) {
                errors.push({status: 400, message: 'Invalid date: February cannot have more than 29 days in a non-leap year.'});
              } else {
                // Перевірка на дату, яка не перевищує сьогоднішню дату
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0); // Встановити час на початок дня
                const enteredDate = new Date(year, month - 1, day); // month - 1, оскільки місяці в Date починаються з 0
                if (enteredDate > currentDate) {
                  errors.push({status: 400, message: 'Invalid date: The date cannot be in the future.'});
                }
              }
            } else {
              errors.push({status: 400, message: 'Invalid date: The day exceeds the maximum number of days in the month.'});
            }
          } else {
            errors.push({status: 400, message: 'Invalid date: The month must be in the range 1 to 12.'});
          }
        }
      } else {
        errors.push({status: 400, message: 'Invalid format date'});
      }
      
      if (errors.length > 0) {
        console.log('Count errors:', errors.length, 'Name errors:', errors);
        return res.status(400).json({ errors });
      }
      // Оновлюємо дані у колекції Sampling_Place
      const updatedChemicalIndex = await Chemical_Index.findByIdAndUpdate(id, newData, { new: true });
      res.status(200).json(updatedChemicalIndex);
    }catch(err){
      console.log('Error upon update chemical index on side server:', err);
    }
})




module.exports = router;