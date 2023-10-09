const titleCase = (str)=> {
    const newStr = str.slice(0,1).toUpperCase() +str.slice(1).toLowerCase();
    return newStr;
}
    
export {titleCase}   