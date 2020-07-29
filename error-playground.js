const sum = (a, b) => {
    if (a && b) {
        
        return a + b;    
    }
    throw new Error('invalid argoment')
}
try {
    console.log(sum(20));
    
} catch (error) {
    console.log('Somthings Problem');
    
}
