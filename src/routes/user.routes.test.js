describe('validateMealCreateChaiExpect', () => {
    it('should pass validation for valid meal data', (done) => {
        const req = {
            body: {
                name: 'Meal Name',
                description: 'Meal Description',
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: false,
                maxAmountOfParticipants: 10,
                price: 9.99,
                imageUrl: 'https://example.com/image.jpg',
                cookId: '1234567890',
                allergenes: ['gluten', 'nuts']
            }
        };
        const res = {};
        const next = (error) => {
            chai.expect(error).to.be.undefined;
            done();
        };

        validateMealCreateChaiExpect(req, res, next);
    });

    it('should throw an error for invalid maxAmountOfParticipants', (done) => {
        const req = {
            body: {
                name: 'Meal Name',
                description: 'Meal Description',
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: false,
                maxAmountOfParticipants: -5, // Invalid value
                price: 9.99,
                imageUrl: 'https://example.com/image.jpg',
                cookId: '1234567890',
                allergenes: ['gluten', 'nuts']
            }
        };
        const res = {};
        const next = (error) => {
            chai.expect(error).to.be.an('error');
            chai.expect(error.message).to.equal('Invalid maxAmountOfParticipants: Must be a positive number');
            done();
        };

        validateMealCreateChaiExpect(req, res, next);
    });
});