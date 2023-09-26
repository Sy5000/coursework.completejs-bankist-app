'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
//----------GENERATE USERNAME ELEMENT----------//
//(use names, split, take 1st letter, join to 1 string)
const generateUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
    //no return needed
  });
};
generateUsernames(accounts);
// console.log(accounts);
//-----------update ui----------//
const updateUI = function (acc) {
  //Display movements
  displayMovements(acc.movements);
  //Display balance
  calcDisplayBalance(acc);
  //Display summary
  calcDisplaySummary(acc);
};

//----------DISPLAY ACCOUNT MOVEMENTS----------//
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = ''; //empty html content in container by classname

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    // console.log(i, mov);
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
    <div class="movements__row">
     <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type} </div>
      <div class="movements__date"> x </div>
      <div class="movements__value">€ ${mov}</div>
      </div>`;

    //class calling method
    containerMovements.insertAdjacentHTML('afterbegin', html); //afterbegin defines start point (also order)

    //doc. query select(movements__row) == html;
  });
};
// displayMovements(account1.movements);// call@login
// console.log(containerMovements.innerHTML); //all html content availbale in console

//generic diplay balance function
const calcDisplayBalance = function (acc) {
  const balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  acc.balance = balance; //assign new var to object to save balance
  labelBalance.textContent = `${acc.balance} EUR`; //update html with var
};
// calcDisplayBalance(account1.movements); call@login

//----------total movements summaries----------//
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const outgiongs = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${outgiongs}`;

  const interest = acc.movements //calc interest for each movement, map new array and reduce to number
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1; // minimum interest is $1, only count movements that accrue >1dollar
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}`;
};
// calcDisplaySummary(account1.movements); //call@login
//DO NOT CHAIN METHODS THAT MUTATE ARRAYS splice etc

//----------lOGIN----------//
//event listener

let currentAccount;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); //disable auto form submission
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  ); //checking against username element generated earlier
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // '?.pin' = optional chaining / only continues chain if condition is true (account exists)
    //Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0] //split, just use first word of string
    }`;
    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    containerApp.style.opacity = 100;

    updateUI(currentAccount); //Update UI
  }
});
//----------MOVE MONEY FUNC----------//
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault(); //stop form from auto submitting
  const amount = Number(inputTransferAmount.value); //convert string to number
  //loop accounts, find account and compare input to username element
  const recieverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  //account to be in credit / reciever exists /available funds / not transferrig to own account
  if (
    amount > 0 &&
    recieverAcc &&
    currentAccount.balance >= amount &&
    recieverAcc?.username !== currentAccount.username // '?.' optional chaining (stop if acc does not exist)
  ) {
    //do the transfer
    //add negative amount to current user
    currentAccount.movements.push(-amount);
    //add positive amount to transfer user
    recieverAcc.movements.push(amount);
    //update UI
    updateUI(currentAccount);
  }

  console.log(recieverAcc, amount);
});
//----------DELETE ACC----------//
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  //validate form fields aganst logged in user
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    console.log('Delete');
    //find index of current accout in the accounts array
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    //delete account from accounts array
    accounts.splice(index, 1);
    //hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});
//----------LOAN APPLICATION----------//
btnLoan.addEventListener('click', function (e) {
  e.preventDefault(); //stop form submit refresh

  const amount = Number(inputLoanAmount.value);
  //grant loan if ANY deposits are >10% of loan
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //add moovement
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});
//----------SORT BUT----------//
let sorted = false; //nuteral
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted); //clicking changes sorted to true
  sorted = !sorted; //save state of sorted var
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
// //methods = functions attached to objects eg object.push

// let arr = ['a', 'b', 'c', 'd', 'e'];

// // SLICE
// console.log(arr.slice(2)); //does not mutate OG array
// console.log(arr.slice(2, 4)); // number = index of arrray
// console.log(arr.slice(-1)); // counts back from end
// console.log(arr.slice(1, -2));
// console.log(arr.slice([...arr]));

// //SPLICE
// // console.log(arr.splice(2)); //does mutate OG array
// arr.splice(-1);
// arr.splice(1, 2); //1=start point, 2=amount to delete
// console.log(arr); //return og array

// //REVERSE
// arr = ['a', 'b', 'c', 'd', 'e'];
// const arr2 = ['j', 'i', 'h', 'g', 'f'];

// console.log(arr2.reverse()); //does mutate og array
// console.log(arr2);

// //CONCAT
// const letters = arr.concat(arr2); //does not mutate og array
// console.log(letters);
// console.log([...arr, ...arr2]); //spread operator

// //JOIN
// console.log(letters.join(' - '));

// //----------
// //AT METHOD

// const arr = [23, 11, 64];
// console.log(arr[0]); //old
// console.log(arr.at(0)); //new
// //getting last arrray element

// console.log(arr[arr.length - 1]);
// console.log(arr.slice(-1)[0]);
// console.log(arr.at(-1));

// console.log('simon'.at(1)); //works on strings

// //----------
// //FOR EACH

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// //FOR OF
// for (const movement of movements) {
//   if (movement > 0) {
//     console.log(`you deposited ${movement}`);
//   } else {
//     console.log(`you withdrew ${Math.abs(movement)}`);
//   }
// }
// //FOR OF index counter
// console.log('----LOOP COUNTER-----');
// for (const [i, movement] of movements.entries()) {
//   if (movement > 0) {
//     console.log(`Movement ${i + 1}: you deposited ${movement}`);
//   } else {
//     console.log(`Movement ${i + 1}: you withdrew ${Math.abs(movement)}`);
//   }
// }
// //for of can break from the loop

// console.log('----FOREACH-----');
// //FOR EACH
// movements.forEach(function (movement) {
//   if (movement > 0) {
//     console.log(`you deposited ${movement}`);
//   } else {
//     console.log(`you withdrew ${Math.abs(movement)}`);
//   }
// });

// console.log('----LOOP COUNTER-----');
// //FOR EACH
// movements.forEach(function (mov, i, arr) {
//   if (mov > 0) {
//     console.log(`Movement ${i + 1}: you deposited ${mov}`);
//   } else {
//     console.log(`Movement ${i + 1}: you withdrew ${Math.abs(mov)}`);
//   }
// });
// //for each will loop over entire array

//----------
//FOR EACH w MAPS & SETS

// //Map
// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currencies.forEach(function (value, key, map) {
//   console.log(`${key} : ${value}`);
// });

// //Set
// const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
// console.log(currenciesUnique);
// currenciesUnique.forEach(function (value, _, map) {
//   console.log(`${value} : ${value}`);
// });

//----------
//CODING CHALLENGE 1
// // TEST DATA 1
// const juliaData = [3, 5, 2, 12, 7];
// const kateData = [4, 1, 15, 8, 3];

// // TEST DATA 2
// // const juliaData = [9, 16, 6, 8, 3];
// // const kateData = [10, 5, 6, 1, 4];

// const juliaDataNew = juliaData.slice(1, -2);
// const fullDataset = juliaDataNew.concat(kateData);

// fullDataset.forEach(function (age, i) {
//   if (age >= 3) {
//     console.log(`Dog ${i + 1} is an adult and ${age} years old`);
//   } else {
//     console.log(`Dog ${i + 1} is still a puppy`);
//   }
// });

// OR

// const checkDogs = function (juliaData, kateData) {
//   const juliaDataNew = juliaData.slice(1, -2);
//   const fullDataset = juliaDataNew.concat(kateData);
//   console.log(fullDataset);

//   fullDataset.forEach(function (age, i) {
//     if (age >= 3) {
//       console.log(`Dog ${i + 1} is an adult and ${age} years old`);
//     } else {
//       console.log(`Dog ${i + 1} is still a puppy`);
//     }
//   });
// };

// checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);

//----------
// DATA TRANSFORMATIONS with MAP, FILTER and REUDCE

//ALL LOOP through arrays

// map = maps values of og array to new array (eg double each number in array)
// filter = filters by specified criteria and saved to new array
// reduce = reduce array to new single value (eg add all) (mutates array)

//----------
// // MAP METHOD

// const eurToUsd = 1.1;
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // const movementsUsd = movements.map(function (mov) {
// //   return mov * eurToUsd;
// // });

// //arrow function
// const movementsUsd = movements.map(mov => mov * eurToUsd);
// console.log(movements, movementsUsd);

// // //same solution with a 'FOR OF' loop
// // const movementsUsdFor = [];
// // for (const mov of movements) {
// //   movementsUsdFor.push(mov * eurToUsd);
// // }
// // console.log(movementsUsdFor);

// // //Arrow function with map method to create new string
// // const movementDescriptions = movements.map((mov, i, arr) => {
// //   if (mov > 0) {
// //     return `Movement ${i + 1}: you deposited ${mov}`;
// //   } else {
// //     return `Movement ${i + 1}: you withdrew ${Math.abs(mov)}`;
// //   }
// // });
// // console.log(movementDescriptions);

// //rebuild with ternary operator
// const movementDescriptions = movements.map(
//   //map method calls the function here, performs func on each iteration of loop
//   (mov, i) =>
//     `Movement ${i + 1}: you ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
//       mov
//     )}`
// );
// console.log(movementDescriptions);
// // ARROW FUNCTIONS - arrow '=>' REPLACES the word 'FUNCTION' and 'RETURN'

////////////////////
//-----DRAFT-----
// const user = 'Steven Thomas Williams'; // stw
// // const username = user.toLowerCase().split(' '); //split using spaces
// const username = user
//   .toLowerCase()
//   .split(' ')
//   .map(name => name[0])
//   .join('');
// console.log(username);

//GUESS
// const generateUsername = username.map(arr => arr[0]); //splice to new array // ANS: OK but add on to username array
// console.log(generateUsername);
//

//----RF-----
// const generateUsername = function (user) {
//   const username = user
//     .toLowerCase()
//     .split(' ')
//     .map(name => name[0])
//     .join('');
//   return username;
// };

// console.log(generateUsername('Steven Thomas Williams'));

//-----RF#2-----
// add a username property to the account object
// const generateUsernames = function (accs) {
//   accs.forEach(function (acc) {
//     acc.username = acc.owner
//       .toLowerCase()
//       .split(' ')
//       .map(name => name[0])
//       .join('');
//     //no return needed
//   });
// };
// generateUsernames(accounts);
// console.log(accounts);

// ////////////////////
// //FILTER METHOD
// // const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// const deposits = movements.filter(val => val > 0); //filter method
// const withdrawals = movements.filter(val => val < 0);

// console.log(movements);
// console.log(deposits);
// console.log(withdrawals);

// //advantage of using function over loop is they can be chained together, loops cannot
////////////////////
//REDUCE METHOD
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// // const balance = movements.reduce(function (acc, cur, i, arr) {
// //   //accumulator absorbs all vals
// //   console.log(`itr ${i} : ${acc}`); //log accumulation
// //   return acc + cur;
// // }, 0); //0 = start point
// // console.log(balance);
// //-----RF-----
// const balance = movements.reduce((acc, cur) => acc + cur, 0); //0 = start point
// console.log(balance);
// // // can do with a loop
// // let balance2 = 0;
// // for (const mov of movements) balance2 += mov;
// // console.log(balance2);

// //maximum value
// const max = movements.reduce((acc, mov) => {
//   //loop through movements array and only save the highest var
//   if (acc > mov) return acc;
//   else return mov;
// }, movements[0]); //set the starting var to same val as movements array at pos 0 (set to just 0 may have unexpected results eg if var is -number)
// console.log(max);

//--------------------
// //CODING CHALLENGE 2
// // // TEST DATA 1
// const data1 = [5, 2, 4, 1, 15, 8, 3];
// // console.log(data1);
// const data2 = [16, 6, 10, 5, 6, 1, 4];
// // console.log(data2);
// //create a function which accepts an array of dogs ages
// const calcAverageHumanAge = function (ages) {
//   //calc each dog age in human years
//   const humanAges = ages.map(age => (age <= 2 ? age * 2 : 16 + age * 4));
//   console.log(humanAges);
//   //exclude all dogs under 18 human years
//   const humanAdultAges = humanAges.filter(val => val > 18); //filter method
//   console.log(humanAdultAges);
//   //calc the average of the results
//   const totalAvg =
//     // humanAdultAges.reduce((acc, age) => acc + age, 0) / humanAdultAges.length;
//     //OR use arr element to calc length
//     humanAdultAges.reduce((acc, age, i, arr) => acc + age / arr.length, 0);
//   // console.log(totalAvg);
//   return totalAvg;
// };
// const avg1 = calcAverageHumanAge(data1);
// const avg2 = calcAverageHumanAge(data2);
// console.log(avg1, avg2);
// ---
// const checkDogs = function (juliaData, kateData) {
//   const juliaDataNew = juliaData.slice(1, -2);
//   const fullDataset = juliaDataNew.concat(kateData);
//   console.log(fullDataset);

//   fullDataset.forEach(function (age, i) {
//     if (age >= 3) {
//       console.log(`Dog ${i + 1} is an adult and ${age} years old`);
//     } else {
//       console.log(`Dog ${i + 1} is still a puppy`);
//     }
//   });
// };

// checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);

// ////////////////////
// //CHAINING METHOODS

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// const eurToUsd = 1.1;

// const totalDepositsUSD = movements
//   .filter(mov => mov < 0)
//   .map(mov => mov * eurToUsd)
//   .reduce((acc, mov) => acc + mov, 0);

// console.log(totalDepositsUSD);

// //debug using arr callback function perameter
// // const totalDepositsUSD = movements
// //   .filter(mov => mov > 0)
// //   .map((mov, i, arr) => {
// //     // console.log(arr);
// //     return mov * eurToUsd;
// //   })
// //   .reduce((acc, mov) => acc + mov, 0);
// // console.log(totalDepositsUSD);

// //array gets manipulated via each method
// //using arr (callback function parameter(index array etc)) you can print the array to debug step by step

////////////////////
//CODING CHALLENGE #3

// // // TEST DATA 1
// const data1 = [5, 2, 4, 1, 15, 8, 3];
// const data2 = [16, 6, 10, 5, 6, 1, 4];

// //create a function which accepts an array of dogs ages
// const calcAverageHumanAge = function (ages) {
//   const averageAge = ages
//     .map(age => (age <= 2 ? age * 2 : 16 + age * 4)) //dogs age in human
//     .filter(val => val > 18) //filter under 18
//     .reduce((acc, age, i, arr) => acc + age / arr.length, 0); //calc average from remaining array
//   //using arr is only way to find length of array in this exampe

//   return averageAge;
// };
// const avg1 = calcAverageHumanAge(data1);
// const avg2 = calcAverageHumanAge(data2);
// console.log(avg1, avg2);
////////////////////
// //FIND METHOD
// // loop callback function
// // will return 1st element in array that is true
// // DOES NOT RETURN ARRAY
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const firstWithdrawal = movements.find(mov => mov < 0);
// console.log(firstWithdrawal);
// //---
// const account = accounts.find(acc => acc.owner === 'Jessica Davis'); //accounts = array that contains account objects
// console.log(account);
////////////////////
// FIND INDEX
// delete item in array needs index of item
// btnClose.addEventListener('click', function (e) {
//   e.preventDefault();

//   //validate form fields aganst logged in user
//   if (
//     inputCloseUsername.value === currentAccount.username &&
//     Number(inputClosePin.value) === currentAccount.pin
//   ) {
//     console.log('Delete');
//     //find index of current accout in the accounts array
//     const index = accounts.findIndex(
//       acc => acc.username === currentAccount.username
//     );
//     console.log(index);
//     //delete account from accounts array
//     accounts.splice(index, 1);
//     //hide UI
//     containerApp.style.opacity = 0;
//   }
//   inputCloseUsername.value = inputClosePin.value = '';
// });
// ////////////////////
// // SUM METHODS

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// console.log(movements);
// console.log(movements.includes(-130)); //tests for exact value
// //OR
// console.log(movements.some(mov => mov === -130)); //tests for condition //another way to test equality
// const anyDeposits = movements.some(mov => mov > 1500); //tests for conditions
// console.log(anyDeposits);
// //EVERY
// console.log(movements.every(mov => mov > 0));
// console.log(account4.movements.every(mov => mov > 0)); //returns true if every element meets condition

// //seperate callback
// const deposit = mov => mov > 0; //loop function
// //apply to methods to get different results
// console.log(movements.some(deposit)); //
// console.log(movements.every(deposit));
// console.log(movements.filter(deposit));

// //////////////////////
// //FLAT AND FLATMAP
// //link arrays and nested arrays
// const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
// console.log(arr.flat());

// const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
// console.log(arrDeep.flat(2)); //2levels deep (nested arrays)

// // //take each account movements, save each as array to new array (array of arrays)
// // const accountMovements = accounts.map(acc => acc.movements);
// // console.log(accountMovements);
// // const allMovements = accountMovements.flat();
// // console.log(allMovements);
// // const totalBal = allMovements.reduce((acc, mov) => acc + mov, 0);
// // console.log(totalBal);

// //chain it
// const totalBal = accounts
//   .map(acc => acc.movements)
//   .flat()
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(totalBal);

// //map then flat is common - flatmap can be used
// const totalBal2 = accounts
//   .flatMap(acc => acc.movements) //cannot specify depth
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(totalBal2);

// ////////////////////
// //SORTING ARRAYS

// const owners = ['Jonas', 'Zack', 'Adam', 'Martha'];
// console.log(owners.sort()); //mutates array
// console.log(owners);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// console.log(movements);
// console.log(movements.sort()); //only searches 'strings'

// // return < 0 A, B (keep order)
// // return > 0 B, A (switch order)
// // keeps looping until all in ascending order
// movements.sort((a, b) => {
//   if (a > b) return 1; //positive
//   if (b > a) return -1; //negative
// });
// console.log(movements);
// // keeps looping until all in descending order
// movements.sort((a, b) => {
//   if (a > b) return -1; //neg
//   if (b > a) return 1; //pos
// });
// console.log(movements);
// //RF
// movements.sort((a, b) => a - b); //logic same as above (+ result keeps order, - changes order)
// console.log(movements);
// movements.sort((a, b) => b - a);
// console.log(movements);

////////////////////
// //CREATE AND FILL ARRAYS
// const arr = [1, 2, 3, 4, 5, 6, 7];
// console.log(new Array(1, 2, 3, 4, 5, 6, 7));
// const x = new Array(7); //empty array x7
// console.log(x);

// // x.fill(1); //fills array with 1s
// x.fill(1, 3, 5); //fills array with 1s //start index // end index
// console.log(x);

// arr.fill(23, 2, 6);
// console.log(arr);

// // Array.from
// const y = Array.from({ length: 7 }, () => 1);
// console.log(y);

// const z = Array.from({ length: 7 }, (_, i) => i + 1); //underscore means 1st perameter isnt needed //just 2nd index
// console.log(z);

////////////////////
// //Array methods practice

// //1
// //count all positive movements
// const bankDepositSum = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 0)
//   .reduce((sum, cur) => sum + cur, 0);

// console.log(bankDepositSum);

// //2
// //count movements over 1000
// // const numDeposits1000 = accounts
// //   .flatMap(acc => acc.movements)
// //   .filter(mov => mov > 1000).length;

// // console.log(numDeposits1000);

// //using reduce to count array ()
// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   // .reduce((count, cur) => (cur >= 1000 ? count + 1 : count), 0);
//   // .reduce((count, cur) => (cur >= 1000 ? count++ : count), 0); // ++ here returns og value
//   .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0); // ++ has to go before counter
// console.log(numDeposits1000);

// //3
// //use reduce to create objects with total withdraw and deposit amounts
// const { deposits, withdrawals } = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
//       sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
//       return sums;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );
// console.log(deposits, withdrawals);

// //4
// //convert string to title case
// const convertTitleCase = function (title) {
//   //function to capitalize word
//   const capitalize = str => str[0].toUpperCase() + str.slice(1);

//   const exceptions = ['a', 'an', 'the', 'but', 'or', 'on', 'in', 'with'];

//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word => (exceptions.includes(word) ? word : capitalize(word))) //if exception do nothing else capitalize
//     .join(' ');
//   return capitalize(titleCase);
// };

// console.log(convertTitleCase('this is a nice title'));
// console.log(convertTitleCase('this is a long ass title, MOTHERFUCKER'));
// console.log(
//   convertTitleCase('this is a nice title, BUT the CAPS is all oVER the PLACE')
// );

////////////////////
//CHALLENGE #4
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];
console.log(dogs);
// const ownersEatTooMuch = [];
// const ownersEatTooLittle = [];
// const ownersEatOkay = [];

// const recommendedFoodPortion = function (array) {
//   array.forEach(function (dog) {
//     dog.recommendedFood = Math.trunc(dog.weight ** 0.75 * 28);

//     if (dog.curFood === dog.recommendedFood) {
//       return true;
//     }

//     const checkDiet = function (dog) {
//       if (
//         dog.curFood > dog.recommendedFood * 0.9 &&
//         dog.curFood < dog.recommendedFood + 1.1
//       ) {
//         // Good diet
//         console.log(dog.owners, true); //T or F
//         ownersEatOkay.push(dog.owners);
//       } else {
//         // Bad Diet
//         // if (dog.curFood > dog.recommendedFood) {
//         //   ownersEatTooMuch.push(dog.owners);
//         // } else if (dog.curFood < dog.recommendedFood) {
//         //   ownersEatTooLittle.push(dog.owners);
//         // }
//         //ternary operator
//         if (
//           dog.curFood > dog.recommendedFood
//             ? ownersEatTooMuch.push(dog.owners)
//             : ownersEatTooLittle.push(dog.owners)
//         );
//       }
//     };
//     checkDiet(dog);
//   });
// };
// recommendedFoodPortion(dogs); //add a recommendedFood element to array

// const dogSarah = dogs.find(dog => dog.owners.includes('Sarah'));
// console.log(
//   `Sarah's dog is eating too ${
//     dogSarah.curFood > dogSarah.recommendedFood ? 'much' : 'little'
//   }`
// );

// console.log(
//   ownersEatTooMuch.flat().join(' and ').concat('s dogs eat too much')
// );
// console.log(
//   ownersEatTooLittle.flat().join(' and ').concat('s dogs eat too little')
// );
// console.log(ownersEatOkay.flat().join('').concat('s dog eats an okay amount'));

// const orderedDogs = dogs.map(x => x.recommendedFood);
// //re-order function
// orderedDogs.sort((a, b) => {
//   if (a > b) return 1;
//   if (b > a) return -1;
// });
// console.log(orderedDogs);

//----------RF----------//
const recommendedFoodPortion = function (array) {
  array.forEach(function (dog) {
    dog.recommendedFood = Math.trunc(dog.weight ** 0.75 * 28);
  });
};
recommendedFoodPortion(dogs);

const ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recommendedFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooMuch);

const ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recommendedFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooLittle);
// const ownersEatOkay = [];

console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too much`);
console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too little`);

//some returns TorF
console.log(dogs.some(dog => dog.curFood === dog.recommendedFood));

const checkDiet = dog =>
  dog.curFood > dog.recommendedFood * 0.9 &&
  dog.curFood < dog.recommendedFood * 1.1;

//T or F
console.log(dogs.some(checkDiet));
//Filter the accounts that return true
// console.log(dogs.filter(checkDiet));

const orderedDogs = dogs
  .slice()
  .sort((a, b) => a.recommendedFood - b.recommendedFood);
console.log(orderedDogs);
