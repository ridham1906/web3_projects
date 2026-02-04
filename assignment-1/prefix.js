import crypto from 'crypto';

let init = 0;

function findPrefixInHash(prefix){
    while(true){ 
    const input = 'helloworld'+init.toString();
    const hash = crypto.createHash('sha256').update(input).digest('hex');

    if(hash.startsWith(prefix)){
        return {input, hash, nonce:init}
    }
    init++ ;
}
};

const res = findPrefixInHash('00000');
console.log(res);